import { NextResponse } from 'next/server';
// Import ไฟล์ JSON จาก path ที่เราวางไว้ (ใช้ @ แทน src/)
import rawData from '@/data/centers.json';

export async function GET() {
  // ดึงข้อมูล array ออกมาจาก key "data" ในไฟล์ JSON
  const centers = rawData.data;

  return NextResponse.json(centers);
}