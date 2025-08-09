import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateTempUserId } from '@/lib/cookies';
import { buildOrderEmailHtml, sendEmail } from '@/lib/email';

// GET - Get user's orders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - Create a new order
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      items, 
      shippingAddress, 
      phone, 
      email,
      latitude,
      longitude,
    } = body;

    const tempUserId = await getOrCreateTempUserId();

    if (!tempUserId || !items || !shippingAddress || !phone || !email) {
      return NextResponse.json({ 
        error: 'User ID, items, shipping address, phone, and email are required' 
      }, { status: 400 });
    }

    // Validate items and calculate total
    let total = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json({ 
          error: `Product ${item.productId} not found` 
        }, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for product ${product.name}` 
        }, { status: 400 });
      }

      total += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
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
      })

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          shippingAddress,
          phone,
          email,
          latitude: typeof latitude === 'number' ? latitude : null,
          longitude: typeof longitude === 'number' ? longitude : null,
        }
      });

      // Create order items
      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
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

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: tempUserId }
      });

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

    // Send confirmation emails (best-effort; do not block response on error)
    try {
      const adminEmail = process.env.ADMIN_EMAIL
      if (orderWithItems) {
        const html = buildOrderEmailHtml({
          orderId: orderWithItems.id,
          total: orderWithItems.total,
          items: orderWithItems.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            price: i.price,
          })),
          shippingAddress: orderWithItems.shippingAddress,
          phone: orderWithItems.phone,
          email: orderWithItems.email || email,
        })

        // Customer
        if (orderWithItems.email) {
          await sendEmail({
            to: orderWithItems.email,
            subject: `Захиалга баталгаажив: ${orderWithItems.id}`,
            html,
          })
        }
        // Admin
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `Шинэ захиалга: ${orderWithItems.id}`,
            html,
          })
        }
      }
    } catch (emailErr) {
      console.error('[ORDER EMAIL ERROR]', emailErr)
    }

    return NextResponse.json(orderWithItems, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
