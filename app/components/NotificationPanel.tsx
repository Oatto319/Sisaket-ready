'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Package, 
  AlertCircle,
  ExternalLink,
  Inbox
} from 'lucide-react';

interface NotificationPanelProps {
  className?: string;
  fullView?: boolean;
}

export default function NotificationPanel({ className = '', fullView = false }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

  // โหลดข้อมูลจาก localStorage (อ้างอิงจากระบบเบิกจ่าย ems_requests)
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('ems_requests');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // เรียงตามเวลาล่าสุด
          setNotifications(data.sort((a: any, b: any) => 
            new Date(b.timestamp || b.time).getTime() - new Date(a.timestamp || a.time).getTime()
          ));
        } catch (e) {
          console.error("Failed to parse notifications", e);
        }
      }
    };

    loadNotifications();
    window.addEventListener('storage', loadNotifications);
    return () => window.removeEventListener('storage', loadNotifications);
  }, []);

  const clearAll = () => {
    if (confirm('คุณต้องการล้างการแจ้งเตือนทั้งหมดใช่หรือไม่?')) {
      setNotifications([]);
      // หมายเหตุ: ในระบบจริงอาจจะแค่ mark as read หรือลบเฉพาะก้อน notification
    }
  };

  return (
    <div className={`flex flex-col ${fullView ? '' : 'bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden'} ${className}`}>
      
      {/* --- Header --- */}
      <div className={`flex items-center justify-between p-5 ${fullView ? 'mb-4' : 'bg-slate-50/50 border-b border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Bell size={18} />
          </div>
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">การแจ้งเตือน</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearAll}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="ล้างทั้งหมด"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* --- Notification List --- */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 ${fullView ? '' : 'max-h-[450px]'}`}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-300">
            <Inbox size={40} className="mb-3 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        ) : (
          notifications.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="group relative flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-900/5 transition-all duration-300"
            >
              {/* Icon Based on Status */}
              <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                item.status === 'PENDING' ? 'bg-amber-50 text-amber-500' : 
                item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-500' : 
                'bg-slate-50 text-slate-400'
              }`}>
                {item.status === 'PENDING' ? <Clock size={20} /> : <Package size={20} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                    item.status === 'PENDING' ? 'bg-amber-500 text-white' : 
                    item.status === 'APPROVED' ? 'bg-blue-600 text-white' : 
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {item.status === 'PENDING' ? 'รายการใหม่' : 'อ่านแล้ว'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {item.time || 'เมื่อครู่'}
                  </span>
                </div>
                
                <h4 className="text-sm font-black text-slate-800 truncate">
                  {item.type || 'เบิกจ่าย'}: {item.item}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  จำนวน <span className="text-blue-600 font-bold">{item.quantity} {item.unit}</span> โดย {item.requester}
                </p>
              </div>

              {/* Action */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Footer (Only in Small View) --- */}
      {!fullView && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
          <button 
            onClick={() => window.location.href = '/notifications'}
            className="w-full py-3 rounded-xl bg-white border border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
          >
            จัดการคำร้องขอทั้งหมด
          </button>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}