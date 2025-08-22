import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('QPay create-order API called');
    
    const body = await request.json();
    console.log('Received body:', body);
    
    const { 
      items, 
      shippingAddress, 
      phone, 
      email,
      latitude,
      longitude,
      paymentId,
      invoiceId,
      status,
      totalAmount,
      pdCm,
      lensInfo
    } = body;

    console.log('Validating required fields...');
    console.log('Items:', items);
    console.log('Shipping address:', shippingAddress);
    console.log('Phone:', phone);
    console.log('Email:', email);
    console.log('Total amount:', totalAmount);
    
    if (!items || !shippingAddress || !phone || !email || !totalAmount) {
      console.log('Missing required fields');
      return NextResponse.json({ 
        error: 'Items, shipping address, phone, email, and total amount are required',
        received: { items: !!items, shippingAddress: !!shippingAddress, phone: !!phone, email: !!email, totalAmount: !!totalAmount }
      }, { status: 400 });
    }
    
    console.log('All required fields present');

    // Validate data types
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return NextResponse.json({ 
        error: 'Total amount must be a positive number',
        received: totalAmount
      }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Items must be a non-empty array',
        received: items
      }, { status: 400 });
    }

    console.log('Starting database transaction...');
    
    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      console.log('Creating/updating user...');
      
      // Ensure we have a User associated by email
      const user = await tx.user.upsert({
        where: { email },
        update: {
          phone: phone ?? undefined,
          address: shippingAddress ?? undefined,
        },
        create: {
          email,
          phone: phone ?? undefined,
          address: shippingAddress ?? undefined,
        },
      });
      
      console.log('User created/updated:', user.id);

      console.log('Creating order with data:', {
        userId: user.id,
        totalAmount,
        status: status || 'PAID',
        shippingAddress,
        phone,
        email,
        latitude,
        longitude,
        paymentId,
        invoiceId,
        qpayStatus: status || 'PAID',
        paid: status === 'PAID'
      });
      
      // Validate status is a valid OrderStatus enum value
      const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAID', 'FAILED'];
      const orderStatus = validStatuses.includes(status) ? status : 'PAID';
      
      console.log('Using order status:', orderStatus);
      
      // Create the order using relation syntax
      const newOrder = await tx.order.create({
        data: {
          user: {
            connect: { id: user.id }
          },
          totalAmount: totalAmount,
          status: orderStatus as any, // Cast to OrderStatus enum
          shippingAddress,
          phone,
          email,
          latitude: typeof latitude === 'number' ? latitude : null,
          longitude: typeof longitude === 'number' ? longitude : null,
          // QPay fields
          paymentId: paymentId || null,
          invoiceId: invoiceId || null,
          qpayStatus: status || 'PAID',
          paid: status === 'PAID',
          pdCm: typeof pdCm === 'number' ? pdCm : null,
          lensInfo: lensInfo ? (lensInfo as object) : undefined
        }
      });
      
      console.log('Order created:', newOrder.id);

      // Create order items
      for (const item of items) {
        // Get product price from database
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { price: true }
        });
        
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    // Return order with items
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    console.log('QPay order created successfully:', orderWithItems);

    return NextResponse.json({
      success: true,
      data: orderWithItems
    }, { status: 201 });

  } catch (err) {
    console.error('QPay order creation error:', err);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create order';
    let errorDetails = 'Unknown error';
    
    if (err instanceof Error) {
      errorMessage = err.message;
      errorDetails = err.stack || 'No stack trace available';
    }
    
    // Log the full error for debugging
    console.error('Full error details:', {
      message: errorMessage,
      details: errorDetails,
      error: err
    });
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}
