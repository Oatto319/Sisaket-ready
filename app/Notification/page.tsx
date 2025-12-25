'use client';

import { useRouter } from 'next/navigation';
// แก้ path ตรงนี้จาก @/components เป็น ../components
import NotificationPanel from '../components/NotificationPanel';
import { ArrowLeft } from 'lucide-react';

export default function NotificationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans p-6">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.back()}
              className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">การแจ้งเตือนทั้งหมด</h1>
        </div>

        {/* ใช้ Component เดิม แต่ปรับความสูงให้เต็ม */}
        <NotificationPanel className="h-[80vh]" fullView={true} />
      </div>
    </div>
  );
}