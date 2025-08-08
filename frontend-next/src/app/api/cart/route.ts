// frontend-next/src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateTempUserId } from '@/lib/cookies';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const userId = await getOrCreateTempUserId();

    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('[CART GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateTempUserId();
    const { productId, quantity } = await req.json();

    // ✅ better error validation
    if (!userId || !productId || quantity < 1) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: existingItem.quantity + quantity },
      });
      return NextResponse.json(updated);
    } else {
      const newItem = await prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
      return NextResponse.json(newItem);
    }
  } catch (error) {
    console.error('[API CART POST ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
