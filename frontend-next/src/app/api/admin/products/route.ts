// File: src/app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
// GET /api/admin/products - get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/admin/products - create new product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { name, description, price, imageUrl, stock, faceShape, categoryId } = body;

    if (!name || !price || !imageUrl || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert Google Drive share URL to direct link
    imageUrl = getDirectDriveLink(imageUrl);

    const newProduct = await prisma.product.create({
      data: { name, description, price, stock, imageUrl, faceShape, categoryId },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
