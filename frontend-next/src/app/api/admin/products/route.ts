// File: src/app/api/admin/products/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/products - get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/admin/products - create new product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, imageUrl, stock, faceShape, categoryId } = body;

    if (!name || !price || !imageUrl || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        stock,
        faceShape,
        categoryId,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
