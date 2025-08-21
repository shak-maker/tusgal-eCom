import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Get all orders for admin
export async function GET(request: Request) {
  try {
    console.log('Admin orders API called');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) {
      where.status = status;
    }

    console.log('Fetching orders with where clause:', where);
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          },
          user: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);
    
    console.log(`Found ${orders.length} orders, total: ${total}`);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Admin orders API error:', err);
    return NextResponse.json({ 
      error: 'Failed to fetch orders',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
} 