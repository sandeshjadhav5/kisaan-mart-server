const express=require("express")
const ProductModel=require("../models/product.model")

const productRouter=express.Router()

//add product route
productRouter.post("/addproduct",async(req,res)=>{
    try {
        const { name, description, price, category, imageUrl } = req.body;
        const newProduct = new ProductModel({
          name,
          description,
          price,
          category,
          imageUrl,
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create product.' });
      }
})

// GET /products route with filtering, sorting, and search
productRouter.get('/filtered', async (req, res) => {
    try {
      let query = ProductModel.find();
  
      // Filter by category if category query parameter is provided
      if (req.query.category) {
        query = query.where('category').equals(req.query.category);
      }
  
      // Sort by price if priceSort query parameter is provided
      if (req.query.priceSort) {
        const sortDirection = req.query.priceSort === 'asc' ? 1 : -1;
        query = query.sort({ price: sortDirection });
      }
  
      // Search by keyword if keyword query parameter is provided
      if (req.query.keyword) {
        const keywordRegex = new RegExp(req.query.keyword, 'i');
        query = query.or([{ name: keywordRegex }, { description: keywordRegex }]);
      }
  
      const products = await query.exec();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch products.' });
    }
  });

  
// Get all products
productRouter.get('/products', async (req, res) => {
    try {
      const products = await ProductModel.find();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch products.' });
    }
  });
  
  // Get a single product by ID
productRouter.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch product.' });
    }
  });
  
  // Update a product by ID
productRouter.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const updatedProduct = await ProductModel.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      res.json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update product.' });
    }
  });
  
// PATCH request to post a review for a product
productRouter.patch('/products/:id/reviews', async (req, res) => {
    const { id } = req.params;
    const { userId, text, rating } = req.body;
  
    try {
      // Find the product by ID
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Create a new review object
      const newReview = {
        user: userId, // Assuming userId is passed in the request body
        text,
        rating,
        createdAt: new Date(),
      };
  
      // Add the new review to the product's reviews array
      product.reviews.push(newReview);
  
      // Update the product in the database
      const updatedProduct = await product.save();
  
      res.json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to post review.' });
    }
  });

  // Delete a product by ID
productRouter.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const deletedProduct = await ProductModel.findByIdAndDelete(id);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      res.json(deletedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete product.' });
    }
  });
  

  module.exports={
    productRouter
  }