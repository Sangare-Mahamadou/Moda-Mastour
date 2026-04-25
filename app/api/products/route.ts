import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: body.price,
        originalPrice: body.originalPrice || null,
        quantity: body.quantity,
        imageUrl: body.imageUrl || "https://via.placeholder.com/500x800?text=Mastou",
        description: body.description || "Nouveau modèle.",
        additionalInfo: body.additionalInfo || null,
        sizes: body.sizes || [],
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        price: body.price,
        originalPrice: body.originalPrice || null,
        quantity: body.quantity,
        imageUrl: body.imageUrl,
        description: body.description,
        additionalInfo: body.additionalInfo || null,
        sizes: body.sizes || [],
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    await prisma.product.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
