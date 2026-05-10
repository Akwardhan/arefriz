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
Login as a buyer/user and receive a JWT token.

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

### POST /api/admin/login
Login as an admin and receive a JWT token.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

**Response:**
```json
{
  "token": "<jwt_token>",
  "user": {
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
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

All cart routes require authentication.

**Headers:**
```
Authorization: Bearer <token>
```

### POST /api/cart/add
Add a product to the cart.

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
Get the current user's cart.

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

### PATCH /api/cart/update
Update the quantity of an item already in the cart.

**Body:**
```json
{
  "productId": "<productId>",
  "quantity": 3
}
```

**Response:** Updated cart object.

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

> Clears the cart automatically after a successful order. Dealer info (`dealerId`, `dealerName`), commission split (`commissionPercent`, `adminAmount`, `dealerAmount`), and `paymentStatus: "pending"` are resolved server-side from the product records.

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
{ "status": "shipped" }
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

## Admin — Orders

### GET /api/admin/orders
Get all orders, latest first. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Array of all order objects.

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

### PATCH /api/admin/orders/:id/pay-dealer
Mark dealer payment as settled. Admin only. Order must have `orderStatus: "delivered"`.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Updated order object with `dealerPaid: true` and `paymentStatus: "paid"`.

> Returns 400 if order is not yet delivered.

---

### POST /api/admin/orders/:id/send-to-dealer
Send order details to a specific dealer via email. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{ "dealerEmail": "dealer@example.com" }
```

**Response:**
```json
{ "message": "Order sent to dealer successfully" }
```

> Sets `emailSent: true` and `emailSentAt` on the order after a successful send.

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
{ "message": "Dealer created successfully" }
```

---

## Admin — Products

### GET /api/admin/products
Get all products with optional filtering and sorting. Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Param     | Type   | Description                                                      |
|-----------|--------|------------------------------------------------------------------|
| `company` | string | Filter by dealer company name (omit or `all` for all companies)  |
| `status`  | string | Filter by status: `approved`, `pending` (omit or `all` for all) |
| `sort`    | string | `latest` (default), `oldest`, `price_high`, `price_low`         |

**Response:**
```json
{
  "products": [
    {
      "_id": "<productId>",
      "name": "Danfoss EVR 10",
      "brand": "Danfoss",
      "category": "valves",
      "price": 4500,
      "image": "/uploads/filename.jpg",
      "status": "approved",
      "dealerName": "ABC HVAC Co.",
      "dealerId": "<dealerId>",
      "createdAt": "2026-05-10T10:00:00.000Z"
    }
  ],
  "companies": ["ABC HVAC Co.", "XYZ Parts Ltd."]
}
```

> `companies` is the list of unique dealer company names present in the DB — use it to populate the company filter dropdown.

---

### PATCH /api/admin/products/:id/status
Toggle a product's visibility (approved ↔ pending). Admin only.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "<productId>",
  "status": "pending"
}
```

> No body required. Each call flips the status: `approved → pending` or `pending → approved`.

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

> JWT payload includes `dealerId` and `role: "dealer"`. Account must be active (`isActive: true`) to log in.

---

## Dealer Products

All routes require dealer JWT token.

**Headers:**
```
Authorization: Bearer <dealer_token>
```

### POST /api/dealer/products
Publish a new product. Accepts `multipart/form-data`.

**Body (form fields):**
```
name* (required)
brand* (required)
category* (required)
price* (required)
description
type
sku
shortDescription
specs        (JSON string: [{ "key": "...", "value": "..." }])
stock
installationCost
image        (file)
```

> `specs` must be sent as a JSON-encoded string when using `multipart/form-data`; it is parsed server-side into an array. Product is auto-assigned `dealerId`, `dealerName`, and `status: "approved"`.

**Response:** Created product object (201).

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

All routes require dealer JWT token.

**Headers:**
```
Authorization: Bearer <dealer_token>
```

### GET /api/dealer/orders
Get all orders assigned to the authenticated dealer.

**Response:** Array of order objects where `dealerId` matches the dealer, latest first.

---

### PATCH /api/dealer/orders/:id/status
Update status of the dealer's own order.

**Body:**
```json
{ "status": "shipped" }
```

> Valid statuses: `processing`, `shipped`, `delivered`, `cancelled`

**Response:** Updated order object.

> Returns 404 if order not found or belongs to another dealer.
