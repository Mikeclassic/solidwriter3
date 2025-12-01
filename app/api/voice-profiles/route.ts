import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  // We manually cast the session here to satisfy TypeScript
  const session = await getServerSession(authOptions) as { 
    user?: { 
      id?: string 
    } 
  } | null;

  if (!session?.user?.id) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, elevenLabsId } = await req.json();

    const voiceProfile = await db.voiceProfile.create({
      data: {
        userId: session.user.id,
        name,
        description,
        elevenLabsId,
      },
    });

    return NextResponse.json(voiceProfile);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating voice profile' }, { status: 500 });
  }
}
