import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (!process.env.API_URL) {
    return NextResponse.json({ error: "API not configured" }, { status: 503 })
  }
  const auth = request.headers.get("Authorization") ?? ""
  try {
    const res = await fetch(`${process.env.API_URL}/orders/my`, {
      headers: { Authorization: auth },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 502 })
  }
}
