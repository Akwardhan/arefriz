const Product = require('../models/Product');

const addProduct = async (req, res) => {
  const { name, brand, category, price, description, images } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const product = await Product.create({
    name,
    brand,
    category,
    price,
    description,
    images,
    image,
    sellerId: req.user.userId,
  });

  res.status(201).json(product);
};

const getProducts = async (req, res) => {
  const { category, brand, type, minPrice, maxPrice } = req.query;

  const filter = { status: 'approved' };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (type) filter.type = type;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter);
  res.json(products);
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
};

module.exports = { addProduct, getProducts, getProductById };
