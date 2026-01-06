import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    // ---------------------------------------------
    // 🛠️ ตั้งค่า User Admin ที่ต้องการตรงนี้
    const adminData = {
      name: "Super Admin",
      email: "admin@sisaket.com", // 👈 อีเมลที่จะใช้ล็อกอิน
      password: "123456", // 👈 รหัสผ่านที่จะใช้
      role: "admin"
    };
    // ---------------------------------------------

    // 1. เช็คก่อนว่ามีอีเมลนี้หรือยัง
    const userExists = await User.findOne({ email: adminData.email });
    
    if (userExists) {
      return NextResponse.json({ 
        message: 'Admin คนนี้มีอยู่ในระบบแล้วครับ! ไปหน้า Login ได้เลย' 
      }, { status: 400 });
    }

    // 2. Hash Password (สำคัญมาก ห้ามลืม)
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // 3. ยัดลง Database เลย
    const newAdmin = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role
    });

    return NextResponse.json({
      message: '✅ สร้าง Admin สำเร็จเรียบร้อย!',
      user: {
        email: newAdmin.email,
        role: newAdmin.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Setup Error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}