// import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return await fetch('http://deploy-backend:8080')  
//   return NextResponse.json({ message: 'Hello from backend route!' });
}