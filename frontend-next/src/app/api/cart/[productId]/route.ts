// frontend-next/src/app/api/cart/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateTempUserId } from '@/lib/cookies';
import { prisma } from '@/lib/db';
import { ApiContext, CartItemUpdateData } from '@/lib/types';

export async function PUT(req: NextRequest, context: ApiContext) {
  try {
    const { productId } = await context.params;
    const userId = await getOrCreateTempUserId();
    const { quantity } = await req.json() as CartItemUpdateData;

    if (!userId || !productId || quantity < 1) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const updated = await prisma.cartItem.update({
      where: {
        userId_productId: { userId, productId },
      },
      data: { quantity },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: ApiContext) {
  try {
    const { productId } = await context.params;
    const userId = await getOrCreateTempUserId();

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ error: 'Failed to delete cart item' }, { status: 500 });
  }
}
