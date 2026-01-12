'use client';

import { useRouter } from 'next/navigation';
// ตรวจสอบ path ให้ตรงกับโครงสร้างโปรเจกต์ของคุณ
import NotificationPanel from '../components/NotificationPanel';
import { ArrowLeft, Bell, Settings } from 'lucide-react';

export default function NotificationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-10">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => router.back()}
              className="group p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bell size={16} className="text-blue-600 fill-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Activity Center</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">การแจ้งเตือนทั้งหมด</h1>
            </div>
          </div>

          <button className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Container */}
        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 overflow-hidden">
          <div className="p-2">
            {/* ส่ง Prop 'fullView' เข้าไปเพื่อให้ NotificationPanel 
               รู้ว่าต้องแสดงผลแบบหน้าเต็ม (ไม่จำกัดความสูง/ไม่มี Scroll ภายในซ้อนกัน)
            */}
            <NotificationPanel className="min-h-[70vh]" fullView={true} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            ระบบจะแสดงประวัติย้อนหลังสูงสุด 50 รายการล่าสุด
          </p>
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #F8FAFC; }
        /* ปรับแต่ง Scrollbar สำหรับหน้าแจ้งเตือน */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}