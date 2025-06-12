// /api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth/authOptions';
import prisma from '@/lib/prisma.db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const searchParams = request.nextUrl.searchParams;
  const receiverId = searchParams.get('receiverId');

  if (!receiverId) {
    return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUser.id, receiverId },
        { senderId: receiverId, receiverId: currentUser.id },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { content, receiverId } = body;
   if (!content || !receiverId) {
      return NextResponse.json(
        { error: 'Content and receiverId are required' },
        { status: 400 }
      );
    }
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }
    const message = await prisma.message.create({
      data: {
        content,
        senderId: sender.id,
        receiverId,
      },
    });

    return NextResponse.json({
      ...message,
    
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}