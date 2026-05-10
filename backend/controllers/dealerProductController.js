const Product = require('../models/Product');
const Dealer = require('../models/Dealer');

const addDealerProduct = async (req, res) => {
  try {
    console.log('req.dealer:', req.dealer);
    console.log('request body:', req.body);

    const dealer = await Dealer.findById(req.dealer.id);
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });

    const { name, brand, category, price, description, type, sku, shortDescription, stock, installationCost } = req.body;

    if (!name || !brand || !category || !price) {
      return res.status(400).json({ message: 'name, brand, category, and price are required' });
    }

    if (req.body.specs && typeof req.body.specs === 'string') {
      try {
        req.body.specs = JSON.parse(req.body.specs);
      } catch {
        return res.status(400).json({ message: 'Invalid JSON in specs field' });
      }
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const productData = {
      name,
      brand,
      category,
      price,
      description,
      type,
      sku,
      shortDescription,
      specs: req.body.specs,
      stock,
      installationCost,
      image,
      dealerId: dealer._id,
      dealerName: dealer.companyName,
      status: 'approved',
    };

    console.log('final product object before save:', productData);

    const product = await Product.create(productData);

    res.status(201).json(product);
  } catch (err) {
    console.error('addDealerProduct error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const getDealerProducts = async (req, res) => {
  try {
    const products = await Product.find({ dealerId: req.dealer.id });
    res.json(products);
  } catch (err) {
    console.error('getDealerProducts error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const updateDealerProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, dealerId: req.dealer.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, brand, category, price, description, type, sku, shortDescription, specs, stock, installationCost } = req.body;

    Object.assign(product, { name, brand, category, price, description, type, sku, shortDescription, specs, stock, installationCost });

    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('updateDealerProduct error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const deleteDealerProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, dealerId: req.dealer.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('deleteDealerProduct error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = { addDealerProduct, getDealerProducts, updateDealerProduct, deleteDealerProduct };
