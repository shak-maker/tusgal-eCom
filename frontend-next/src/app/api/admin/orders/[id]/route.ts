import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiContext } from '@/lib/types';
import { getEnglishStatus, getMongolianStatus } from '@/lib/orderStatusMap';

// GET /api/admin/orders/[id] - get single order
export async function GET(
  req: NextRequest,
  context: ApiContext
) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Convert status to Mongolian text
    const orderWithMongolianStatus = {
      ...order,
      status: getMongolianStatus(order.status)
    };

    return NextResponse.json(orderWithMongolianStatus);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/admin/orders/[id] - update order status
export async function PUT(
  req: NextRequest,
  context: ApiContext
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, paid, shippingAddress, phone, email } = body;

    console.log('🔄 Admin order update request:', { id, body });

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      console.log('❌ Order not found:', id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('📋 Current order status:', existingOrder.status);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (status) {
      // Convert Mongolian status text to English enum value
      const englishStatus = getEnglishStatus(status);
      if (englishStatus) {
        updateData.status = englishStatus;
        console.log('🔄 Updating status from', existingOrder.status, 'to', englishStatus);
      } else {
        console.log('❌ Invalid status:', status);
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
    }
    if (typeof paid === 'boolean') updateData.paid = paid;
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    console.log('📝 Update data:', updateData);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
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

    console.log('✅ Order updated successfully:', { id, newStatus: updatedOrder.status });
    
    // Convert status to Mongolian text for response
    const updatedOrderWithMongolianStatus = {
      ...updatedOrder,
      status: getMongolianStatus(updatedOrder.status)
    };
    
    return NextResponse.json(updatedOrderWithMongolianStatus);
  } catch (error) {
    console.error('💥 Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/admin/orders/[id] - delete order
export async function DELETE(
  req: NextRequest,
  context: ApiContext
) {
  try {
    const { id } = await context.params;
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete order (this will cascade delete order items)
    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
