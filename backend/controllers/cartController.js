const Cart = require('../models/Cart');

const recalcTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const getCartHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.json({ items: [], totalAmount: 0 });
  return res.json({ items: cart.items, totalAmount: cart.totalAmount });
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

  const existingItem = cart.items.find((item) => item.productId.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity || 1;
  } else {
    cart.items.push({ productId, name, price, image, quantity: quantity || 1 });
  }

  cart.totalAmount = recalcTotal(cart.items);
  await cart.save();
  res.json({ items: cart.items, totalAmount: cart.totalAmount });
};

const updateCartItem = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  if (quantity === 0) {
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
  } else {
    const existing = cart.items.find((item) => item.productId.toString() === productId);
    if (existing) existing.quantity = quantity;
  }

  cart.totalAmount = recalcTotal(cart.items);
  await cart.save();
  res.json({ items: cart.items, totalAmount: cart.totalAmount });
};

const removeFromCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const { id: productId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
  cart.totalAmount = recalcTotal(cart.items);
  await cart.save();
  res.json({ items: cart.items, totalAmount: cart.totalAmount });
};

const clearCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("USER FROM TOKEN:", req.user);

  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
  }

  res.json({ items: [], totalAmount: 0 });
};

module.exports = { addToCart, getCart: getCartHandler, updateCartItem, removeFromCart, clearCart };
