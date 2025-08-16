import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiContext } from "@/lib/types";

// GET - Get a single product by ID
export async function GET(
  request: NextRequest,
  context: ApiContext
) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  context: ApiContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, price, imageUrl, stock, faceShape, categoryId } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        imageUrl,
        stock: stock ? parseInt(stock) : undefined,
        faceShape,
        categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  context: ApiContext
) {
  try {
    const { id } = await context.params;
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
