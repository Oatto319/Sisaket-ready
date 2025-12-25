'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  MessageSquare,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface NotificationPanelProps {
  className?: string; // รับค่า className เพื่อปรับความสูงได้
  fullView?: boolean; // โหมดแสดงผลเต็มหน้า (สำหรับหน้า Notification)
}

export default function NotificationPanel({ className, fullView = false }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

  // ฟังก์ชันคำนวณเวลา
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'เมื่อสักครู่';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return 'เมื่อวาน';
  };

  // โหลดข้อมูล
  const loadNotifications = () => {
    try {
        const stored = localStorage.getItem('ems_requests');
        if (stored) {
            const requests = JSON.parse(stored);
            const notifs = requests.map((req: any) => ({
                id: req.id,
                title: `เบิก: ${req.item}`,
                desc: `${req.quantity} ${req.unit} โดย ${req.requester}`,
                time: req.timestamp || Date.now(),
                type: 'request',
                status: req.status
            }));
            
            const systemNotifs = [
                { id: 'sys1', title: 'ระบบพร้อมทำงาน', desc: 'สถานะเซิร์ฟเวอร์ปกติ', time: Date.now() - 3600000, type: 'system', status: 'READ' }
            ];

            setNotifications([...notifs, ...systemNotifs].sort((a, b) => b.time - a.time));
        } else {
            setNotifications([{ id: 'sys1', title: 'ยินดีต้อนรับ', desc: 'เริ่มใช้งานระบบ', time: Date.now(), type: 'system', status: 'READ' }]);
        }
    } catch (error) {
        console.error("Notif load error:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Auto refresh every 2 seconds
    const interval = setInterval(loadNotifications, 2000);
    // Listen to storage events
    window.addEventListener('storage', loadNotifications);
    return () => {
        clearInterval(interval);
        window.removeEventListener('storage', loadNotifications);
    };
  }, []);

  const handleClearData = () => {
    if(confirm('ยืนยันล้างข้อมูลคำร้องขอทั้งหมด?')) {
        localStorage.removeItem('ems_requests');
        loadNotifications();
        // ส่ง event บอกหน้าอื่นให้ update ตัวเลข stats
        window.dispatchEvent(new Event('storage'));
    }
  };

  const pendingCount = notifications.filter(n => n.status === 'PENDING').length;

  return (
    <div className={`rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md flex flex-col ${className || 'h-[400px]'}`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/40">
            <h3 className="text-white font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" /> การแจ้งเตือน
                {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold animate-pulse">
                    {pendingCount} ใหม่
                </span>
                )}
            </h3>
            <div className="flex gap-2">
                <button onClick={loadNotifications} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="รีเฟรช">
                    <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={handleClearData} className="p-1 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400" title="ล้างข้อมูล">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
        
        {/* Content List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                <MessageSquare className="w-8 h-8 opacity-20" />
                <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
                </div>
            ) : (
                notifications.map((notif, idx) => (
                <div key={idx} className={`p-3 rounded-xl border transition-all hover:bg-slate-800/80 ${notif.status === 'PENDING' ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-800/30 border-slate-700/50'}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${notif.status === 'PENDING' ? 'bg-yellow-500 text-black' : 'bg-slate-600 text-slate-300'}`}>
                        {notif.status === 'PENDING' ? 'รออนุมัติ' : 'อ่านแล้ว'}
                        </span>
                        <span className="text-[10px] text-slate-400">{getTimeAgo(notif.time)}</span>
                    </div>
                    <h4 className={`font-medium text-sm ${notif.status === 'PENDING' ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.desc}</p>
                </div>
                ))
            )}
        </div>
        
        {/* Footer (Link to full page) */}
        {!fullView && (
            <div className="p-3 border-t border-slate-700/50 bg-slate-800/40">
                <Link href="/cards/request" className="block w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-center text-xs text-slate-200 transition-colors">
                จัดการคำร้องขอทั้งหมด
                </Link>
            </div>
        )}
    </div>
  );
}