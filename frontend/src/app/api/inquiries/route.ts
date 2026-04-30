import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  if (!process.env.API_URL) {
    return NextResponse.json({ ok: true })
  }
  try {
    const body = await request.json()
    const auth = request.headers.get("authorization")
    const res = await fetch(`${process.env.API_URL}/inquiries`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return NextResponse.json({}, { status: res.status })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({}, { status: 502 })
  }
}

export async function GET(request: NextRequest) {
  if (!process.env.API_URL) {
    return NextResponse.json([])
  }
  try {
    const auth = request.headers.get("authorization")
    const res = await fetch(`${process.env.API_URL}/inquiries`, {
      cache:   "no-store",
      headers: auth ? { authorization: auth } : {},
    })
    if (!res.ok) return NextResponse.json([], { status: res.status })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json([], { status: 502 })
  }
}
