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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const tokenPayload = { 
        id: newUser._id.toString(), 
        email: newUser.email, 
        name: newUser.name 
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