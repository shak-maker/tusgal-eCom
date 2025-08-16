import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiContext } from "@/lib/types";

// GET - Get order by ID
export async function GET(
  request: NextRequest,
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

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  context: ApiContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, paid } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paid !== undefined) updateData.paid = paid;

    const order = await prisma.order.update({
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

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
} 