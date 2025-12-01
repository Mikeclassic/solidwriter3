import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // FIXED: Changed from @/lib/db

export async function POST(req: Request) {
  // Manual type cast to fix the 'user.id' error
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

    // FIXED: Changed 'db' to 'prisma'
    const voiceProfile = await prisma.voiceProfile.create({
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
