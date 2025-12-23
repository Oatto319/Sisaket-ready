import mongoose, { Schema, Document } from 'mongoose';

// ✅ Interface สำหรับ TypeScript
export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive' | 'leave';
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Employee Schema
const EmployeeSchema = new Schema<IEmployee>(
  {
    // ✅ ชื่อจริง (required, min 2 chars)
    firstName: {
      type: String,
      required: [true, 'กรุณาใส่ชื่อจริง'],
      minlength: [2, 'ชื่อจริงต้องอย่างน้อย 2 ตัวอักษร'],
      trim: true,
    },

    // ✅ นามสกุล (required, min 2 chars)
    lastName: {
      type: String,
      required: [true, 'กรุณาใส่นามสกุล'],
      minlength: [2, 'นามสกุลต้องอย่างน้อย 2 ตัวอักษร'],
      trim: true,
    },

    // ✅ อีเมล (required, unique)
    email: {
      type: String,
      required: [true, 'กรุณาใส่อีเมล'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'กรุณาใส่อีเมลที่ถูกต้อง'
      ],
      trim: true,
    },

    // ✅ เบอร์โทรศัพท์ (required, 10 digits)
    phone: {
      type: String,
      required: [true, 'กรุณาใส่เบอร์โทรศัพท์'],
      match: [/^[0-9]{10}$/, 'เบอร์โทรศัพท์ต้องเป็น 10 ตัวเลข'],
    },

    // ✅ แผนก (required)
    department: {
      type: String,
      required: [true, 'กรุณาใส่แผนก'],
      trim: true,
    },

    // ✅ ตำแหน่ง (required)
    position: {
      type: String,
      required: [true, 'กรุณาใส่ตำแหน่ง'],
      trim: true,
    },

    // ✅ เงินเดือน (required, >= 0)
    salary: {
      type: Number,
      required: [true, 'กรุณาใส่เงินเดือน'],
      min: [0, 'เงินเดือนต้องมากกว่า 0'],
    },

    // ✅ วันที่เข้างาน (required)
    hireDate: {
      type: Date,
      required: [true, 'กรุณาใส่วันที่เข้างาน'],
    },

    // ✅ สถานะ (default: active)
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'leave'],
        message: 'สถานะต้องเป็น active, inactive, หรือ leave'
      },
      default: 'active',
    },
  },
  {
    timestamps: true, // ✅ auto create createdAt, updatedAt
  }
);

// ✅ Export Model
export default mongoose.models.Employee || 
  mongoose.model<IEmployee>('Employee', EmployeeSchema);