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
      totalAmount
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
      
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount: totalAmount,
          status: status || 'PAID',
          shippingAddress,
          phone,
          email,
          latitude: typeof latitude === 'number' ? latitude : null,
          longitude: typeof longitude === 'number' ? longitude : null,
          // QPay fields
          paymentId: paymentId || null,
          invoiceId: invoiceId || null,
          qpayStatus: status || 'PAID',
          paid: status === 'PAID'
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
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
