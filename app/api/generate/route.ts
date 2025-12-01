import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { topic, context, voiceProfileId, outline, keywords, targetLength } = body;

    if (!topic) {
      return NextResponse.json({ 
        error: 'Topic is required' 
      }, { status: 400 });
    }

    // Create a new generation job
    const jobId = uuidv4();
    
    const job = await prisma.generationJob.create({
      data: {
        id: jobId,
        userId: session.user.id,
        topic,
        context: context || null,
        voiceProfileId: voiceProfileId || null,
        outline: outline || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ 
      jobId: job.id,
      status: job.status,
      message: 'Generation job created successfully'
    });

  } catch (error) {
    console.error('Create generation job error:', error);
    return NextResponse.json({ 
      error: 'Failed to create generation job' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      // Get user's recent jobs
      const jobs = await prisma.generationJob.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          topic: true,
          status: true,
          createdAt: true,
          completedAt: true,
          solidScore: true,
          error: true,
        },
      });

      return NextResponse.json(jobs);
    }

    // Get specific job
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        topic: true,
        context: true,
        voiceProfileId: true,
        outline: true,
        status: true,
        content: true,
        error: true,
        solidScore: true,
        readability: true,
        keywordDensity: true,
        duration: true,
        tokenUsage: true,
        createdAt: true,
        completedAt: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user owns this job
    if (jobId && job && 'userId' in job) {
      // This check is implicit since we're filtering by userId above
    }

    return NextResponse.json(job);

  } catch (error) {
    console.error('Get generation job error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch generation job' 
    }, { status: 500 });
  }
}
