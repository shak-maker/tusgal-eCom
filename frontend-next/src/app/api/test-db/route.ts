import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      counts: {
        users: userCount,
        products: productCount,
        orders: orderCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
