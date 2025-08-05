import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/orders/[id] - get single order
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/admin/orders/[id] - update order status
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, paid, shippingAddress, phone, email } = body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (typeof paid === 'boolean') updateData.paid = paid;
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/admin/orders/[id] - delete order
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete order (this will cascade delete order items)
    await prisma.order.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
