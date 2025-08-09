import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/products/[id] - get single product
export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: context.params.id },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] - update product
export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const body = await req.json();
    const { name, description, price, imageUrl, stock, faceShape, categoryId } = body;

    if (!name || !price || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: context.params.id }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: context.params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        stock: parseInt(stock) || 0,
        faceShape,
        categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - delete product
export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: context.params.id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: context.params.id }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
