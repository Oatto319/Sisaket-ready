import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { verifyJwtToken } from '@/lib/utils/jwt';

// 🟢 GET: ดึงสินค้าทั้งหมด (ใครก็ดึงได้ ไม่ต้อง Login)
export async function GET() {
  await connectDB();
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }); // ตัวใหม่มาบนสุด
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: 'ดึงข้อมูลสินค้าไม่สำเร็จ' }, { status: 500 });
  }
}

// 🔴 POST: เพิ่มสินค้า (ต้องมี Token/Login เท่านั้น)
export async function POST(req: Request) {
  try {
    // 1. ตรวจสอบ Token (Security Check)
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1]; // ดึงคำว่า Bearer ออก

    if (!token || !verifyJwtToken(token)) {
      return NextResponse.json({ message: 'Unauthorized: กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
    }

    // 2. บันทึกข้อมูล
    const body = await req.json();
    await connectDB();

    const newProduct = await Product.create(body);

    return NextResponse.json({ message: 'เพิ่มสินค้าสำเร็จ', product: newProduct }, { status: 201 });

  } catch (error) {
    console.error('Create Product Error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' }, { status: 500 });
  }
}