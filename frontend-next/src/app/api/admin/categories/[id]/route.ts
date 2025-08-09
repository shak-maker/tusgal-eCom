import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/categories/[id] - get single category
export async function GET(
  req: NextRequest,
  // Loosen context type to satisfy Next.js route handler checker
  context: any
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: context.params.id },
      include: {
        products: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PUT /api/admin/categories/[id] - update category
export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: context.params.id }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if new name conflicts with another category
    const nameConflict = await prisma.category.findFirst({
      where: {
        name,
        id: { not: context.params.id }
      }
    });

    if (nameConflict) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: context.params.id },
      data: {
        name,
        description
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - delete category
export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    // Check if category exists and has products
    const category = await prisma.category.findUnique({
      where: { id: context.params.id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with existing products' 
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: context.params.id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
