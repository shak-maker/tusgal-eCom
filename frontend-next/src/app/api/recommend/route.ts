import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { category: true },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('[RECOMMEND GET ERROR]', error);
    // Return empty list to avoid failing requests in production
    return NextResponse.json([]);
  }
}
