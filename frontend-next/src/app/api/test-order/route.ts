import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Test order creation with minimal data
    const testOrder = await prisma.$transaction(async (tx) => {
      // Create a test user
      const user = await tx.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          name: 'Test User',
          phone: '1234567890'
        },
      });

      // Create a test order
      const order = await tx.order.create({
        data: {
          user: {
            connect: { id: user.id }
          },
          totalAmount: 1000,
          status: 'PAID',
          shippingAddress: 'Test Address',
          phone: '1234567890',
          email: 'test@example.com',
          paid: true,
          qpayStatus: 'PAID'
        }
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      order: testOrder
    });
  } catch (error) {
    console.error('Test order creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
