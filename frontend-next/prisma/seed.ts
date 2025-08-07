import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data in correct order (due to foreign key constraints)
  await prisma.orderItem.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  const categories = [
    { name: 'Харааны', description: 'Vision glasses for daily use' },
    { name: 'Нарны', description: 'Sunglasses for outdoor activities' },
    { name: 'Хүүхдийн', description: 'Kids glasses collection' },
  ]

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    })
  }

  // Get categories for product creation
  const visionCategory = await prisma.category.findUnique({ where: { name: 'Харааны' } })
  const sunglassesCategory = await prisma.category.findUnique({ where: { name: 'Нарны' } })
  const kidsCategory = await prisma.category.findUnique({ where: { name: 'Хүүхдийн' } })

  // Create sample products
  const products = [
    {
      name: 'Буянаа стайл',
      description: 'Classic black rectangular glasses with blue tint lenses',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      stock: 10,
      faceShape: 'Оваль',
      categoryId: visionCategory?.id,
    },
    {
      name: 'Монгол стайл',
      description: 'Black rounder glasses with modern design',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop',
      stock: 15,
      faceShape: 'Дугуй',
      categoryId: visionCategory?.id,
    },
    {
      name: 'Улаанбаатар стайл',
      description: 'Black rectangular glasses with unique frame shape',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      stock: 8,
      faceShape: 'Тэгш өнцөгт',
      categoryId: visionCategory?.id,
    },
    {
      name: 'Хөх стайл',
      description: 'Black rectangular glasses with different angle',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      stock: 12,
      faceShape: 'Тэгш өнцөгт',
      categoryId: visionCategory?.id,
    },
    {
      name: 'Нарны стайл 1',
      description: 'Silver-framed thin rectangular glasses with wavy temple arm',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop',
      stock: 20,
      faceShape: 'Тэгш өнцөгт',
      categoryId: sunglassesCategory?.id,
    },
    {
      name: 'Нарны стайл 2',
      description: 'Olive green slightly rounded rectangular glasses',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      stock: 18,
      faceShape: 'Дугуй',
      categoryId: sunglassesCategory?.id,
    },
    {
      name: 'Нарны стайл 3',
      description: 'Silver-framed oval-shaped glasses with decorative temple arms',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      stock: 14,
      faceShape: 'Оваль',
      categoryId: sunglassesCategory?.id,
    },
    {
      name: 'Нарны стайл 4',
      description: 'Silver-framed rectangular glasses with simple straight temple arm',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop',
      stock: 16,
      faceShape: 'Тэгш өнцөгт',
      categoryId: sunglassesCategory?.id,
    },
    {
      name: 'Хүүхдийн стайл 1',
      description: 'Colorful kids glasses with fun design',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      stock: 25,
      faceShape: 'Дугуй',
      categoryId: kidsCategory?.id,
    },
    {
      name: 'Хүүхдийн стайл 2',
      description: 'Durable kids glasses with safety features',
      price: 150000,
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      stock: 22,
      faceShape: 'Оваль',
      categoryId: kidsCategory?.id,
    },
  ]

  // Create new products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 