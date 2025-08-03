import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { error } from "console";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {name, description, price, imageUrl, stock, faceShape } = body

    if(!name || !price || !imageUrl){
        return NextResponse.json({error: 'Мэдээлэл дутуу байна.'}, {status: 400})
    }

    const product = await prisma.product.create({
        data: {
            name, 
            description,
            price, 
            imageUrl,
            stock, 
            faceShape
        },
    })

    return NextResponse.json(product, {status: 201})
  } catch(err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error"}, { status: 500})
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
