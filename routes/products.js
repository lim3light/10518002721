const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../services/ecommerceService');

// GET /categories/:categoryname/products
router.get('/:categoryname/products', async (req, res) => {
  const { categoryname } = req.params;
  const { n = 10, page = 1, sort = '' } = req.query;

  try {
    const products = await getProducts(categoryname, n, page, sort);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /categories/:categoryname/products/:productid
router.get('/:categoryname/products/:productid', async (req, res) => {
  const { categoryname, productid } = req.params;

  try {
    const product = await getProductById(categoryname, productid);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
