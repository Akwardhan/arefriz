# ARefriz Backend — API Documentation

Base URL: `http://localhost:5001`

---

## Auth

### POST /api/auth/register
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "<userId>"
}
```

---

### POST /api/auth/login
Login and receive a JWT token.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "<jwt_token>",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

---

## Products

### GET /api/products
Get all approved products. No authentication required.

**Query Parameters (all optional):**
| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category |
| `brand` | string | Filter by brand |
| `type` | string | Filter by type |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |

**Response:** Array of product objects.

---

### GET /api/products/:id
Get a single product by ID. No authentication required.

**Response:** Product object or 404 if not found.

---

### POST /api/products
Add a new product. Requires authentication. Accepts `multipart/form-data` (single `image` file).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form fields):**
```
name, brand, category, price, description, image (file)
```

**Response:** Created product object.

---

## Cart

### POST /api/cart/add
Add a product to the cart (no auth required — cart is session-global).

**Body:**
```json
{
  "productId": "<productId>",
  "quantity": 1,
  "price": 120
}
```

**Response:** Updated cart object with populated product details.

---

### GET /api/cart
Get the current cart.

**Response:**
```json
{
  "products": [
    {
      "productId": { "_id": "...", "name": "...", "price": 120, "image": "..." },
      "quantity": 1,
      "price": 120
    }
  ],
  "totalAmount": 120
}
```

---

### DELETE /api/cart/:productId
Remove a specific product from the cart.

**Response:** Updated cart object.

---

### DELETE /api/cart/clear
Clear the entire cart.

**Response:**
```json
{ "message": "Cart cleared" }
```

---

## Orders

### POST /api/orders
Place a new order. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "products": [
    { "productId": "<productId>", "quantity": 2 }
  ],
  "shippingDetails": {
    "name": "John Doe",
    "phone": "9999999999",
    "address": "123 Main St"
  },
  "subtotal": 240,
  "logisticsCost": 50,
  "installationCost": 0,
  "techSurcharge": 10,
  "taxes": 30
}
```

**Response:**
```json
{ "orderId": "<orderId>" }
```

> Clears the cart automatically after a successful order.

---

### GET /api/orders
Get orders. Requires authentication.
- **Admin** — returns all orders.
- **Buyer** — returns only their own orders.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Array of order objects (products populated with name, price, image).

---

### GET /api/orders/my
Get the currently authenticated user's orders only.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Array of order objects for the logged-in user, latest first.

---

### PATCH /api/orders/:id/status
Update order status. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{ "status": "processing" }
```

> Valid statuses: `processing`, `shipped`, `delivered`, `cancelled`

**Response:** Updated order object.

---

### POST /api/orders/send-to-dealer
Send order details to a dealer via email. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "orderId": "<orderId>",
  "dealerEmail": "dealer@example.com"
}
```

**Response:**
```json
{ "message": "Email sent successfully" }
```

---

## Admin Orders (dedicated admin prefix)

### GET /api/admin/orders
Get all orders. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Array of all order objects, latest first.

---

### PATCH /api/admin/orders/:id
Update order status. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{ "status": "shipped" }
```

> Valid statuses: `processing`, `shipped`, `delivered`, `cancelled`

**Response:** Updated order object.

---

## Inquiries

### POST /api/inquiries
Submit a product inquiry. No authentication required.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "message": "Is this available in blue?",
  "productId": "<productId>"
}
```

> `productId` is optional. `name`, `email`, `phone`, and `message` are required.

**Response:**
```json
{
  "message": "Inquiry submitted successfully",
  "inquiryId": "<inquiryId>"
}
```

---

### GET /api/inquiries
Get all inquiries. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Array of inquiry objects, latest first.

---

## Admin — Dealers

### GET /api/admin/dealers
Get all dealers. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{ "dealers": [...] }
```

> Password field is excluded from response.

---

### POST /api/admin/dealers
Create a dealer account manually. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "John Dealer",
  "companyName": "Dealer Co.",
  "email": "dealer@example.com",
  "password": "123456",
  "phone": "9999999999"
}
```

**Response:**
```json
{
  "message": "Dealer created successfully",
  "dealerId": "<dealerId>"
}
```

---

## Dealer Auth

### POST /api/dealer/register
Register a new dealer account.

**Body:**
```json
{
  "name": "John Dealer",
  "companyName": "Dealer Co.",
  "email": "dealer@example.com",
  "password": "123456",
  "phone": "9999999999"
}
```

**Response:**
```json
{
  "message": "Dealer registered successfully",
  "dealerId": "<dealerId>"
}
```

---

### POST /api/dealer/login
Login as a dealer.

**Body:**
```json
{
  "email": "dealer@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "<jwt_token>",
  "dealer": {
    "id": "<dealerId>",
    "name": "John Dealer",
    "companyName": "Dealer Co.",
    "email": "dealer@example.com"
  }
}
```

> JWT payload includes `dealerId` and `role: "dealer"`.

---

## Dealer Products

All routes require dealer JWT token.

**Headers:**
```
Authorization: Bearer <dealer_token>
```

### POST /api/dealer/products
Add a new product. Accepts `multipart/form-data`.

**Body (form fields):**
```
name, brand, category, price, description, type, sku,
shortDescription, specs, stock, installationCost, image (file)
```

**Response:** Created product object.

---

### GET /api/dealer/products
Get all products belonging to the authenticated dealer.

**Response:** Array of product objects.

---

### PUT /api/dealer/products/:id
Update a dealer's own product. Accepts `multipart/form-data`.

**Body (form fields):** Same as POST, all optional.

**Response:** Updated product object.

> Returns 404 if product not found or belongs to another dealer.

---

### DELETE /api/dealer/products/:id
Delete a dealer's own product.

**Response:**
```json
{ "message": "Product deleted successfully" }
```

> Returns 404 if product not found or belongs to another dealer.

---

## Dealer Orders

### GET /api/dealer/orders
Get all orders assigned to the authenticated dealer.

**Headers:**
```
Authorization: Bearer <dealer_token>
```

**Response:** Array of order objects where `dealerId` matches the dealer.

---

### PATCH /api/dealer/orders/:id/status
Update status of dealer's own order.

**Headers:**
```
Authorization: Bearer <dealer_token>
```

**Body:**
```json
{ "status": "shipped" }
```

> Valid statuses: `processing`, `shipped`, `delivered`

**Response:** Updated order object.

> Returns 404 if order not found or belongs to another dealer.
