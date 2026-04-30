import { BASE_URL } from "@/lib/config"

export function getImageUrl(image: string | null | undefined): string {
  if (!image) return ""
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  // path from backend: "/uploads/filename.png" → prepend origin only
  if (image.startsWith("/")) return BASE_URL ? `${BASE_URL}${image}` : image
  // bare filename: "filename.png" → prepend origin + /uploads/
  return BASE_URL ? `${BASE_URL}/uploads/${image}` : image
}
