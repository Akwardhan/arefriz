import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  if (!process.env.API_URL) {
    return NextResponse.json({ error: "API not configured" }, { status: 503 })
  }
  try {
    const body = await request.json()
    const res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 502 })
  }
}
