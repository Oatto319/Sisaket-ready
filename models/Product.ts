import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: false, default: 'https://placehold.co/600x400' },
    category: { type: String, required: true },
    stock: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);