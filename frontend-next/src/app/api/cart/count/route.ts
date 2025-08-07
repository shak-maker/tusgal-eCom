import { NextResponse } from 'next/server';
import { getOrCreateTempUserId } from '@/lib/cookies';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const userId = await getOrCreateTempUserId();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      select: { quantity: true },
    });

    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to get cart count:', error);
    return NextResponse.json({ count: 0 });
  }
} 