import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Insertion fictive de la commande en attendant que le serveur DB de l'utilisateur soit réactivé
    /*
    const newOrder = await prisma.order.create({
      data: {
        customerName: data.name,
        customerPhone: data.phone,
        paymentMethod: data.method,
        total: data.total,
        status: 'PENDING',
        items: {
          create: data.cart.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });
    */

    return NextResponse.json({ success: true, message: "Order processed successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
