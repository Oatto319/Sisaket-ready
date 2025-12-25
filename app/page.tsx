'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// กำหนดหน้าตาข้อมูลสินค้า
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. ตรวจสอบว่าล็อกอินหรือยัง?
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login'); // ถ้ายังไม่ล็อกอิน ดีดไปหน้า Login
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 2. ดึงข้อมูลสินค้าจาก API
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) return <div className="p-10 text-center text-xl">กำลังโหลดสินค้า...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- ส่วนหัว (Navbar) --- */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          👟 ThisIs.Shop
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 hidden sm:inline">สวัสดี, <b>{user?.name}</b></span>
          <button 
            onClick={handleLogout}
            className="text-sm border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-50 transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* --- ส่วนแสดงสินค้า (Product Grid) --- */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-bold text-gray-800">สินค้าแนะนำ 🔥</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-400 text-lg">ยังไม่มีสินค้าในร้าน</p>
            <p className="text-sm text-gray-300 mt-2">ลองเพิ่มสินค้าผ่าน Postman ดูสิ!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                {/* รูปสินค้า */}
                <div className="h-64 overflow-hidden bg-gray-100 relative">
                  <img 
                    src={product.imageUrl || 'https://placehold.co/600x400'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 bg-white/90 px-2 py-1 text-xs font-bold rounded-md shadow-sm">
                    {product.category}
                  </span>
                </div>
                
                {/* รายละเอียด */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{product.description || 'ไม่มีรายละเอียด'}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-blue-600">฿{product.price.toLocaleString()}</span>
                    <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition active:scale-95">
                      ใส่ตะกร้า
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}