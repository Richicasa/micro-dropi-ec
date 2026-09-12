import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const products = store.getProducts();
  return NextResponse.json({ products });
}
