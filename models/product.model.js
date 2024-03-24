const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      description: String,
      price: {
        type: Number,
        required: true,
      },
      category: {
        type: String,
        enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Organic', 'Agri Implements',"Gardening","Others"],
        required: true,
      },
      imageUrl: String, 
      rating: {
        type: Number,
        default: 0,
      },
      reviews: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          text: String,
          rating: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    }, { timestamps: true });

const ProductModel = mongoose.model('product', productSchema);

module.exports = ProductModel;
