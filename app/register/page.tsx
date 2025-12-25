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

  if (loading) return <div className="p-10 text-center">กำลังโหลดสินค้า...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- ส่วนหัว (Navbar) --- */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">ThisIs.Shop 👟</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">สวัสดี, {user?.name}</span>
          <button 
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* --- ส่วนแสดงสินค้า (Product Grid) --- */}
      <main className="container mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">สินค้าทั้งหมด</h2>
        
        {products.length === 0 ? (
          <p className="text-center text-gray-500">ยังไม่มีสินค้าในร้าน</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                {/* รูปสินค้า */}
                <div className="h-64 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* รายละเอียด */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{product.category}</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-2">{product.name}</h3>
                    </div>
                    <span className="text-lg font-bold text-green-600">฿{product.price.toLocaleString()}</span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
                    หยิบใส่ตะกร้า
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}