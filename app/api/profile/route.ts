import { NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/utils/jwt'; // หรือ path ที่คุณเก็บ function verify ไว้

export async function GET(request: Request) {
  try {
    // 1. ดึง Token จาก Header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'ไม่พบ Token หรือรูปแบบไม่ถูกต้อง' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1]; // ตัดคำว่า "Bearer " ออก เอาแค่ตัวรหัส

    // 2. ตรวจสอบ Token (Verify)
    const payload = verifyJwtToken(token);

    if (!payload) {
      return NextResponse.json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' }, { status: 401 });
    }

    // 3. ถ้าผ่าน! ส่งข้อมูลลับกลับไป
    return NextResponse.json({ 
      message: 'ยินดีต้อนรับเข้าสู่พื้นที่ส่วนตัว!',
      user: payload // ส่งข้อมูลที่แกะได้จาก token กลับไปให้ดู
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}