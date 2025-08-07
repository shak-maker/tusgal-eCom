// frontend-next/src/app/api/cart/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateTempUserId } from '@/lib/cookies';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
  const userId = await getOrCreateTempUserId();
  const { quantity } = await req.json();

  const updated = await prisma.cartItem.update({
    where: {
      userId_productId: { userId, productId: params.productId },
    },
    data: { quantity },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { productId: string } }) {
  const userId = await getOrCreateTempUserId();

  await prisma.cartItem.delete({
    where: { userId_productId: { userId, productId: params.productId } },
  });

  return NextResponse.json({ success: true });
}
