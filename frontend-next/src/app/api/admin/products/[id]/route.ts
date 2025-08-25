import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiContext } from '@/lib/types';

// Helper: convert Google Drive share URL to direct image link
function getDirectDriveLink(url: string) {
  try {
    // Normalize and clean the URL
    url = url.trim().replace(/\s+/g, '');
    
    // Handle standard share URL format
    const fileMatch = url.match(/https?:\/\/(www\.)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(view|preview)(\?.*)?/);
    if (fileMatch && fileMatch[2]) {
      return `https://drive.google.com/uc?export=view&id=${fileMatch[2]}`;
    }
    
    // Handle open URL format
    const openMatch = url.match(/https?:\/\/(www\.)?drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch && openMatch[2]) {
      return `https://drive.google.com/uc?export=view&id=${openMatch[2]}`;
    }
    
    // Handle direct uc format (already correct)
    if (/https?:\/\/(www\.)?drive\.google\.com\/uc\?export=view&id=[a-zA-Z0-9_-]+/.test(url)) {
      return url;
    }
    
    // Handle shortened URLs
    const shortMatch = url.match(/https?:\/\/(www\.)?drive\.google\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (shortMatch && shortMatch[2]) {
      return `https://drive.google.com/uc?export=view&id=${shortMatch[2]}`;
    }
    
    return url; // Return original if no match
  } catch {
    return url;
  }
}



// GET /api/admin/products/[id] - get single product
export async function GET(req: NextRequest, context: ApiContext) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
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
export async function PUT(req: NextRequest, context: ApiContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    let { name, description, price, imageUrl, stock, faceShape, categoryId } = body;

    if (!name || !price || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert Google Drive share URL if needed
    imageUrl = getDirectDriveLink(imageUrl);

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        stock: parseInt(stock) || 0,
        faceShape,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - delete product
export async function DELETE(req: NextRequest, context: ApiContext) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}


