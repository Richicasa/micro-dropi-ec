import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const orders = store.getOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder = store.createOrder(body);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creando pedido";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
