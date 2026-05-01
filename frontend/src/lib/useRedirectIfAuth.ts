"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useRedirectIfAuth() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("userToken")
    if (token) router.replace("/")
  }, [router])
}
