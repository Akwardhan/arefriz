const CART_KEY = "arefriz_cart"

function dispatch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"))
  }
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartItem[]
  } catch {
    return []
  }
}

export function addToCart(item: Omit<CartItem, "quantity">): void {
  const cart = getCart()
  const existing = cart.find((i) => i.productId === item.productId)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...item, quantity: 1 })
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  dispatch()
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter((i) => i.productId !== productId)
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  dispatch()
}

export function updateQuantity(productId: string, quantity: number): void {
  if (quantity < 1) {
    removeFromCart(productId)
    return
  }
  const cart = getCart()
  const item = cart.find((i) => i.productId === productId)
  if (item) {
    item.quantity = quantity
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    dispatch()
  }
}
