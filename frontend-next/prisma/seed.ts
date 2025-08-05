import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Sunglasses',
        description: 'Stylish sunglasses for all occasions'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Prescription Glasses',
        description: 'High-quality prescription eyewear'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Reading Glasses',
        description: 'Comfortable reading glasses'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Safety Glasses',
        description: 'Protective eyewear for work and sports'
      }
    })
  ]);

  console.log('📂 Created categories');

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Ray-Ban Aviator Classic',
        description: 'Timeless aviator sunglasses with gold frame and green lenses',
        price: 154.99,
        imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
        stock: 25,
        faceShape: 'Oval',
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Oakley Holbrook',
        description: 'Sporty sunglasses with matte black frame and polarized lenses',
        price: 178.00,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
        stock: 12,
        faceShape: 'Round',
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Warby Parker Clark',
        description: 'Modern prescription glasses with acetate frame',
        price: 95.00,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        stock: 8,
        faceShape: 'Square',
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Tom Ford Square Frame',
        description: 'Luxury prescription glasses with premium materials',
        price: 450.00,
        imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
        stock: 5,
        faceShape: 'Square',
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Reading Glasses +2.0',
        description: 'Comfortable reading glasses with anti-glare coating',
        price: 29.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        stock: 50,
        faceShape: 'Universal',
        categoryId: categories[2].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Safety Goggles Industrial',
        description: 'Heavy-duty safety glasses for industrial use',
        price: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
        stock: 30,
        faceShape: 'Universal',
        categoryId: categories[3].id
      }
    })
  ]);

  console.log('👓 Created products');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1-555-0123',
        address: '123 Main St, New York, NY 10001'
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        phone: '+1-555-0456',
        address: '456 Oak Ave, Los Angeles, CA 90210'
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike.wilson@example.com',
        name: 'Mike Wilson',
        phone: '+1-555-0789',
        address: '789 Pine Rd, Chicago, IL 60601'
      }
    })
  ]);

  console.log('👥 Created users');

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        total: 154.99,
        status: 'PENDING',
        paid: false,
        shippingAddress: '123 Main St, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'john.doe@example.com',
        items: {
          create: {
            productId: products[0].id,
            quantity: 1,
            price: 154.99
          }
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        total: 273.00,
        status: 'SHIPPED',
        paid: true,
        shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
        phone: '+1-555-0456',
        email: 'jane.smith@example.com',
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: 178.00
            },
            {
              productId: products[2].id,
              quantity: 1,
              price: 95.00
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[2].id,
        total: 450.00,
        status: 'CONFIRMED',
        paid: true,
        shippingAddress: '789 Pine Rd, Chicago, IL 60601',
        phone: '+1-555-0789',
        email: 'mike.wilson@example.com',
        items: {
          create: {
            productId: products[3].id,
            quantity: 1,
            price: 450.00
          }
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[0].id,
        total: 74.99,
        status: 'DELIVERED',
        paid: true,
        shippingAddress: '123 Main St, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'john.doe@example.com',
        items: {
          create: [
            {
              productId: products[4].id,
              quantity: 2,
              price: 29.99
            },
            {
              productId: products[5].id,
              quantity: 1,
              price: 15.01
            }
          ]
        }
      }
    })
  ]);

  console.log('📦 Created orders');

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Orders: ${orders.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 