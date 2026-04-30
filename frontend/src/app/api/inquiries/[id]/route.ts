import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!process.env.API_URL) return NextResponse.json({ ok: true })
  try {
    const body = await request.json()
    const auth = request.headers.get("authorization")
    const res  = await fetch(`${process.env.API_URL}/inquiries/${id}`, {
      method:  "PATCH",
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!process.env.API_URL) return NextResponse.json({ ok: true })
  try {
    const body = await request.json()
    const auth = request.headers.get("authorization")
    const res  = await fetch(`${process.env.API_URL}/inquiries/${id}/reply`, {
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
