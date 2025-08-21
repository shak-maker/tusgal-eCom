import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    console.log('Products API called');
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    console.log('Category filter:', category);

    const whereClause = category && category !== 'all' 
      ? { categoryId: category }
      : {};
    console.log('Where clause:', whereClause);

    console.log('Fetching products from database...');
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('Products fetched successfully:', products.length);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, imageUrl, stock, faceShape, categoryId } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        stock,
        faceShape,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
