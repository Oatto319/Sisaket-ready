import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signJwtToken } from '@/lib/utils/jwt';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'อีเมลนี้มีการลงทะเบียนแล้ว' }, { status: 409 });
    }

    // ---------------------------------------------------------
    // 👑 ส่วนที่เพิ่ม: กำหนดอีเมล Admin
    // (ใส่อีเมลของคุณที่จะใช้เป็น Admin ที่นี่)
    const ADMIN_EMAILS = ['add@gmail.com', 'admin@sisaket.com']; 
    
    // เช็คว่าอีเมลที่สมัคร อยู่ในลิสต์แอดมินไหม?
    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
    // ---------------------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // 👈 บันทึก Role ลง Database (ต้องแก้ Model User ก่อนนะ)
    });

    const tokenPayload = { 
        id: newUser._id.toString(), 
        email: newUser.email, 
        name: newUser.name,
        role: newUser.role // 👈 ฝัง Role ลงใน Token ด้วย เพื่อให้ Frontend เอาไปใช้ง่ายๆ
    };
    
    const token = signJwtToken(tokenPayload);

    return NextResponse.json({
      message: 'ลงทะเบียนสำเร็จ',
      token,
      user: tokenPayload
    }, { status: 201 });

  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}