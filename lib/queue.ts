import { Queue, Worker, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';

// BullMQ requires maxRetriesPerRequest to be null
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export interface GenerationJobData {
  jobId: string;
  userId: string;
  topic: string;
  context?: string;
  voiceProfileIds?: string[];
  outline?: string;
  keywords?: string[];
  targetLength?: 'short' | 'medium' | 'long';
}

export interface JobResult {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    tokenUsage?: number;
    duration?: number;
    solidScore?: number;
  };
}

// Create the generation queue
export const generationQueue = new Queue<GenerationJobData>('generation', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  } as JobsOptions,
});

// REMOVED: generationQueueScheduler is no longer needed in BullMQ v5+

// Worker for processing generation jobs
export const generationWorker = new Worker<GenerationJobData>(
  'generation',
  async (job) => {
    const { jobId, userId, topic, context, voiceProfileIds, outline, keywords } = job.data;
    
    try {
      console.log(`Starting generation job ${jobId} for user ${userId}`);
      
      // Import dependencies here to avoid circular imports
      const { kimiClient } = await import('./kimi-client');
      const { voiceProfileEngine } = await import('./voice-profile');
      const { seoScoringEngine } = await import('./seo-scoring');
      const { prisma } = await import('./prisma');
      
      // Get voice profile samples if specified
      let voiceProfileSamples: string[] = [];
      if (voiceProfileIds && voiceProfileIds.length > 0) {
        const allSamples: string[] = [];
        for (const profileId of voiceProfileIds) {
          try {
            const samples = await voiceProfileEngine.getVoiceProfileSamples(profileId);
            allSamples.push(...samples);
          } catch (error) {
            console.warn(`Failed to get samples for profile ${profileId}:`, error);
          }
        }
        voiceProfileSamples = allSamples;
      }
      
      // Update job status to processing
      await prisma.generationJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING' },
      });
      
      const startTime = Date.now();
      
      // Generate content using Kimi
      const content = await kimiClient.generateContent({
        topic,
        outline,
        context,
        voiceProfileSamples,
        streaming: false,
      });
      
      const duration = Date.now() - startTime;
      
      // Analyze SEO metrics
      const seoMetrics = seoScoringEngine.analyzeContent(content, keywords);
      
      // Update job with results
      await prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          content,
          solidScore: seoMetrics.solidScore,
          readability: seoMetrics.readabilityScore,
          keywordDensity: JSON.stringify(seoMetrics.keywordDensity),
          duration,
          tokenUsage: Math.ceil(content.length / 4), // Rough estimation
          completedAt: new Date(),
        },
      });
      
      console.log(`Generation job ${jobId} completed successfully`);
      
      return {
        success: true,
        content,
        metadata: {
          duration,
          solidScore: seoMetrics.solidScore,
        },
      };
      
    } catch (error) {
      console.error(`Generation job ${jobId} failed:`, error);
      
      // Update job status to failed
      await prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  {
    connection,
    concurrency: 3, // Process up to 3 jobs concurrently
  }
);

// Helper function to add generation jobs
export async function addGenerationJob(data: GenerationJobData): Promise<string> {
  const job = await generationQueue.add('generate', data, {
    delay: 0,
    priority: 1,
  });
  
  return job.id as string;
}

// Helper function to get job status
export async function getJobStatus(jobId: string) {
  const job = await generationQueue.getJob(jobId);
  if (!job) return null;
  
  const state = await job.getState();
  const progress = job.progress;
  const result = job.returnvalue;
  
  return {
    id: job.id,
    state,
    progress,
    result,
    data: job.data,
  };
}

// Error handling for the worker
generationWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

generationWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

// Clean up function
export function closeQueue() {
  return Promise.all([
    generationQueue.close(),
    // generationQueueScheduler removed
    connection.quit(),
  ]);
}
