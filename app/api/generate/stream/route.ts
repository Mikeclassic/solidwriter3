import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kimiClient } from '@/lib/kimi-client';
import { voiceProfileEngine } from '@/lib/voice-profile';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const topic = searchParams.get('topic');
  const voiceProfileId = searchParams.get('voiceProfileId');
  const outline = searchParams.get('outline');

  if (!jobId || !topic) {
    return new Response('Missing required parameters', { status: 400 });
  }

  try {
    // Get voice profile samples if specified
    let voiceProfileSamples: string[] = [];
    if (voiceProfileId) {
      voiceProfileSamples = await voiceProfileEngine.getVoiceProfileSamples(voiceProfileId);
    }

    // Update job status to processing
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedContent = '';
          
          // Generate content with streaming
          for await (const chunk of kimiClient.generateStream({
            topic,
            outline: outline || undefined,
            voiceProfileSamples,
            streaming: true,
          })) {
            accumulatedContent += chunk;
            
            // Send the chunk to the client
            const data = `data: ${JSON.stringify({ 
              type: 'chunk', 
              content: chunk,
              accumulated: accumulatedContent 
            })}\n\n`;
            
            controller.enqueue(encoder.encode(data));
          }

          // Update job with completed content
          await prisma.generationJob.update({
            where: { id: jobId },
            data: {
              status: 'COMPLETED',
              content: accumulatedContent,
              completedAt: new Date(),
            },
          });

          // Send completion signal
          const doneData = `data: ${JSON.stringify({ 
            type: 'done', 
            content: accumulatedContent 
          })}\n\n`;
          
          controller.enqueue(encoder.encode(doneData));
          controller.close();

        } catch (error) {
          console.error('Streaming generation error:', error);
          
          // Update job status to failed
          await prisma.generationJob.update({
            where: { id: jobId },
            data: {
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Generation failed',
              completedAt: new Date(),
            },
          });

          const errorData = `data: ${JSON.stringify({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'Generation failed' 
          })}\n\n`;
          
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
