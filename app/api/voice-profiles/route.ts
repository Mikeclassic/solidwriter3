import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { voiceProfileEngine } from '@/lib/voice-profile';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions) as { 
  user?: { 
    id?: string 
  } 
} | null;
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profiles = await voiceProfileEngine.getUserVoiceProfiles(session.user.id);
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Get voice profiles error:', error);
    return NextResponse.json({ error: 'Failed to fetch voice profiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as { 
  user?: { 
    id?: string 
  } 
} | null;
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, samples } = body;

    if (!name || !samples || !Array.isArray(samples) || samples.length === 0) {
      return NextResponse.json({ 
        error: 'Name and samples array are required' 
      }, { status: 400 });
    }

    const profileId = await voiceProfileEngine.createVoiceProfile({
      name,
      description,
      samples,
      userId: session.user.id,
    });

    return NextResponse.json({ id: profileId, name, description });
  } catch (error) {
    console.error('Create voice profile error:', error);
    return NextResponse.json({ 
      error: 'Failed to create voice profile' 
    }, { status: 500 });
  }
}
