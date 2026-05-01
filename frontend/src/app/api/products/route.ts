import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  if (!process.env.API_URL) {
    return NextResponse.json({ error: "API not configured" }, { status: 503 })
  }
  try {
    // Forward multipart/form-data as-is so the backend receives the file
    const auth = request.headers.get("authorization")
    const formData = await request.formData()
    const res = await fetch(`${process.env.API_URL}/products`, {
      method:  "POST",
      headers: auth ? { authorization: auth } : {},
      body:    formData,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 502 })
  }
}

export async function GET(request: NextRequest) {
  if (!process.env.API_URL) {
    return NextResponse.json([])
  }
  try {
    const res = await fetch(`${process.env.API_URL}/products`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 502 })
  }
}
