'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. ดึง Token ออกมา
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login'); // ถ้าไม่มี token ดีดกลับไปหน้า login
      return;
    }

    // 2. ยิง API พร้อมแนบ Token ไปใน Header
    fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}` // 👈 หัวใจสำคัญ
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('token'); // ถ้า token เน่า ให้ลบทิ้ง
        router.push('/login');
      }
    });
  }, [router]);

  if (!user) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Welcome, {user.name} 👋</h1>
      <p className="text-gray-600">Email: {user.email}</p>
      <p className="mt-4 p-4 bg-yellow-100 rounded">
        นี่คือพื้นที่ส่วนตัว (Protected Route)
      </p>
      
      <button 
        onClick={() => {
          localStorage.removeItem('token'); // Logout คือการลบ Token
          router.push('/login');
        }}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}