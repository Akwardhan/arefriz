const Cart = require('../models/Cart');

const getCart = async () => {
  let cart = await Cart.findOne();
  if (!cart) {
    cart = await Cart.create({ products: [], totalAmount: 0 });
  }
  return cart;
};

const recalcTotal = (products) =>
  products.reduce((sum, item) => sum + item.price * item.quantity, 0);

const addToCart = async (req, res) => {
  const { productId, quantity, price } = req.body;

  const cart = await getCart();

  const existing = cart.products.find(
    (p) => p.productId.toString() === productId
  );

  if (existing) {
    existing.quantity += quantity || 1;
  } else {
    cart.products.push({ productId, quantity: quantity || 1, price });
  }

  cart.totalAmount = recalcTotal(cart.products);
  await cart.save();

  const populated = await Cart.findById(cart._id).populate('products.productId', 'name price image');
  res.json(populated);
};

const getCartHandler = async (req, res) => {
  const cart = await Cart.findOne().populate('products.productId', 'name price image');
  if (!cart) return res.json({ products: [], totalAmount: 0 });
  res.json(cart);
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await getCart();

  cart.products = cart.products.filter(
    (p) => p.productId.toString() !== productId
  );
  cart.totalAmount = recalcTotal(cart.products);
  await cart.save();

  res.json(cart);
};

const clearCart = async (req, res) => {
  const cart = await Cart.findOne();

  if (cart) {
    cart.products = [];
    cart.totalAmount = 0;
    await cart.save();
  }

  res.json({ message: "Cart cleared" });
};

module.exports = { addToCart, getCart: getCartHandler, removeFromCart, clearCart };
