import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signJwtToken } from '@/lib/utils/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    await connectDB();

    // 1. หา User จากอีเมล
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // 2. เช็คว่าเป็น User ที่สมัครผ่าน Google หรือไม่ (ถ้าใช่จะไม่มี password)
    if (!user.password) {
        return NextResponse.json({ message: 'อีเมลนี้ลงทะเบียนผ่าน Google กรุณาล็อกอินด้วย Google' }, { status: 400 });
    }

    // 3. ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // 4. สร้าง Token
    const tokenPayload = { 
        id: user._id.toString(), 
        email: user.email, 
        name: user.name 
    };
    
    const token = signJwtToken(tokenPayload);

    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: tokenPayload
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}