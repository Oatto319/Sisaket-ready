// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 👇 ต้องเพิ่มบรรทัดนี้ ไม่งั้น Role จะไม่ถูกบันทึก
  role: { type: String, default: 'user', enum: ['user', 'admin'] }, 
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);