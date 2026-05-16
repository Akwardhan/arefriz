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
  try {
    const { category, brand, type, minPrice, maxPrice } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 100);
    const skip  = (page - 1) * limit;

    const filter = { status: 'approved' };
    if (category) filter.category = category;
    if (brand)    filter.brand    = brand;
    if (type)     filter.type     = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { status: 'approved' });
    res.json(categories.filter(Boolean).sort());
  } catch (err) {
    console.error('getCategories error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addProduct, getProducts, getProductById, getCategories };
