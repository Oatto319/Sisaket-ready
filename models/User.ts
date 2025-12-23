import mongoose, { Schema, Document } from 'mongoose';

// ✅ Interface สำหรับ TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// ✅ User Schema
const UserSchema = new Schema<IUser>(
  {
    // ✅ ชื่อ (required, min 2 chars)
    name: {
      type: String,
      required: [true, 'กรุณาใส่ชื่อ'],
      minlength: [2, 'ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร'],
      trim: true, // ลบ spaces ด้านหน้า-หลัง
    },

    // ✅ อีเมล (required, unique)
    email: {
      type: String,
      required: [true, 'กรุณาใส่อีเมล'],
      unique: true, // ไม่ซ้ำ
      lowercase: true, // เล็กหมด
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'กรุณาใส่อีเมลที่ถูกต้อง'
      ],
      trim: true,
    },

    // ✅ รหัสผ่าน (required, min 6 chars)
    password: {
      type: String,
      required: [true, 'กรุณาใส่รหัสผ่าน'],
      minlength: [6, 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร'],
      select: false, // ไม่ return password by default
    },

    // ✅ บทบาท (default: user)
    role: {
      type: String,
      enum: {
        values: ['admin', 'manager', 'user'],
        message: 'Role ต้องเป็น admin, manager, หรือ user'
      },
      default: 'user',
    },
  },
  {
    timestamps: true, // ✅ auto create createdAt, updatedAt
  }
);

// ✅ Export Model
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);