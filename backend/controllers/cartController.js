const Cart = require('../models/Cart');

const getCartHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.json({ items: [] });
  return res.json({ items: cart.items });
};

const addToCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const { productId, name, price, image, quantity } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItem = cart.items.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, name, price, image, quantity });
  }

  await cart.save();
  res.json({ items: cart.items });
};

const updateCartItem = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  if (quantity === 0) {
    cart.items = cart.items.filter((item) => item.productId !== productId);
  } else {
    const existing = cart.items.find((item) => item.productId === productId);
    if (existing) existing.quantity = quantity;
  }

  await cart.save();
  res.json({ items: cart.items });
};

const removeFromCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const { productId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter((item) => item.productId !== productId);
  await cart.save();
  res.json({ items: cart.items });
};

const clearCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({ items: [] });
};

module.exports = { addToCart, getCart: getCartHandler, updateCartItem, removeFromCart, clearCart };
