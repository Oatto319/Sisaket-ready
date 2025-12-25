import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: false }, // ใส่ false ไว้ก่อนเผื่อ login ไม่ได้ส่ง name มา
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);