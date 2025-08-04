import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Get user by email or create new user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user if not exists
      user = await prisma.user.create({
        data: { email }
      });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// POST - Create or update user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, phone, address } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone,
        address
      },
      create: {
        email,
        name,
        phone,
        address
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 