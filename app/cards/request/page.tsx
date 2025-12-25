'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Package,
  MoreVertical,
  Filter
} from 'lucide-react';

export default function RequestPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);

  // Default Mock Data
  const defaultRequests = [
    {
      id: 'mock1',
      item: 'น้ำดื่ม (แพ็ค)',
      quantity: 50,
      unit: 'แพ็ค',
      requester: 'ศูนย์พักพิงวัดมหาพุทธาราม',
      location: 'อ.เมือง',
      status: 'PENDING', 
      time: '10 นาทีที่แล้ว',
      urgency: 'HIGH'
    }
  ];

  useEffect(() => {
    // โหลดข้อมูล
    const stored = localStorage.getItem('ems_requests');
    if (stored) {
       try {
         const localData = JSON.parse(stored);
         if(localData.length > 0) {
             setRequests(localData);
         } else {
             setRequests(defaultRequests);
         }
       } catch (e) {
         setRequests(defaultRequests);
       }
    } else {
        setRequests(defaultRequests);
    }
  }, []);

  // ฟังก์ชันอัปเดตสถานะ (อนุมัติ / ปฏิเสธ)
  const handleUpdateStatus = (id: any, newStatus: string) => {
    // 1. อัปเดตสถานะ
    const updatedRequests = requests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('ems_requests', JSON.stringify(updatedRequests));

    // 2. *** กรณีปฏิเสธ (REJECTED) ให้คืนของเข้าคลัง ***
    if (newStatus === 'REJECTED') {
        const targetRequest = requests.find(r => r.id === id);
        if (targetRequest) {
            const storedInv = localStorage.getItem('ems_inventory');
            if (storedInv) {
                const inventory = JSON.parse(storedInv);
                
                // หา item ที่ตรงกัน (ใช้ ID ถ้ามี, หรือใช้ชื่อ)
                let itemIndex = -1;
                if (targetRequest.itemId) {
                    itemIndex = inventory.findIndex((i: any) => i.id === targetRequest.itemId);
                } else {
                    itemIndex = inventory.findIndex((i: any) => i.name === targetRequest.item);
                }
                
                if (itemIndex !== -1) {
                    // คืนสต๊อก
                    inventory[itemIndex].stock += targetRequest.quantity;
                    
                    // บันทึกกลับ
                    localStorage.setItem('ems_inventory', JSON.stringify(inventory));
                    window.dispatchEvent(new Event('storage')); // บอกหน้า Inventory ให้รีเฟรช
                    alert(`ปฏิเสธคำร้องขอ: คืน ${targetRequest.item} จำนวน ${targetRequest.quantity} เข้าคลังแล้ว`);
                }
            }
        }
    } else {
        // กรณี APPROVED ไม่ต้องทำอะไรเพิ่ม
        window.dispatchEvent(new Event('storage'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'APPROVED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'รออนุมัติ';
      case 'APPROVED': return 'อนุมัติแล้ว';
      case 'REJECTED': return 'ถูกปฏิเสธ';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-0 bg-[#0B1120]/80 backdrop-blur-md py-4 z-20 border-b border-slate-800/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => router.back()}
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-orange-600 hover:border-orange-500 hover:text-white transition-all duration-300 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">รายการคำร้องขอ</h1>
              <p className="text-sm text-slate-400">อนุมัติและจัดการสิ่งของช่วยเหลือ</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหารายการ..." 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none"
                />
             </div>
             <button className="p-2 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 text-slate-400 hover:text-white">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="space-y-4 pb-10">
          {requests.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
                <p>ไม่มีรายการคำร้องขอ</p>
            </div>
          ) : (
            requests.map((req: any) => (
                <div 
                key={req.id}
                className="group relative flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/30 hover:bg-slate-800/80 transition-all duration-200"
                >
                <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-800 border border-slate-700 ${req.urgency === 'CRITICAL' ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-slate-300'}`}>
                    <Package className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                            {req.item}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadge(req.status)}`}>
                            {getStatusLabel(req.status)}
                        </span>
                    </div>
                    
                    <p className="text-white font-medium mb-1">
                        จำนวน: {req.quantity} {req.unit}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {req.requester}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {req.time}
                        </span>
                    </div>
                    </div>
                </div>

                <div className="flex sm:flex-col items-center justify-center sm:border-l sm:border-slate-800 sm:pl-4 gap-2 w-full sm:w-auto">
                    {req.status === 'PENDING' ? (
                    <>
                        <button 
                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                            className="flex-1 w-full sm:w-32 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> อนุมัติ
                        </button>
                        <button 
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                            className="flex-1 w-full sm:w-32 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 text-sm font-medium transition-colors border border-slate-700 hover:border-red-500/30 flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-4 h-4" /> ปฏิเสธ
                        </button>
                    </>
                    ) : (
                        <button className="w-full sm:w-32 px-4 py-2 rounded-lg bg-slate-800 text-slate-500 text-sm font-medium border border-slate-700 cursor-default flex items-center justify-center gap-2">
                            <MoreVertical className="w-4 h-4" /> จัดการ
                        </button>
                    )}
                </div>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}