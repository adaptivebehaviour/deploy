import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://deploy-backend:8080", { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}