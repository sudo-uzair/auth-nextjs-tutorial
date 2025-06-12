import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma.db';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}