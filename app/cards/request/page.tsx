'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Filter,
  Utensils,
  Pill,
  Shirt,
  Tent
} from 'lucide-react';

export default function RequestPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // รายชื่อหมวดหมู่สำหรับการกรอง
  const categories = [
    { id: 'ALL', label: 'ทั้งหมด', icon: Package },
    { id: 'FOOD', label: 'อาหาร/น้ำดื่ม', icon: Utensils },
    { id: 'MEDICINE', label: 'ยารักษาโรค', icon: Pill },
    { id: 'CLOTHING', label: 'เครื่องนุ่งห่ม', icon: Shirt },
    { id: 'SUPPLIES', label: 'ของใช้ทั่วไป', icon: Tent },
  ];

  // Default Mock Data (เพิ่ม field category)
  const defaultRequests = [
    {
      id: 'mock1',
      item: 'น้ำดื่ม (แพ็ค)',
      category: 'FOOD',
      quantity: 50,
      unit: 'แพ็ค',
      requester: 'ศูนย์พักพิงวัดมหาพุทธาราม',
      location: 'อ.เมือง',
      status: 'PENDING', 
      time: '10 นาทีที่แล้ว',
      urgency: 'HIGH'
    },
    {
      id: 'mock2',
      item: 'พาราเซตามอล',
      category: 'MEDICINE',
      quantity: 100,
      unit: 'แผง',
      requester: 'โรงเรียนสตรีสิริเกศ',
      location: 'อ.เมือง',
      status: 'PENDING', 
      time: '15 นาทีที่แล้ว',
      urgency: 'MEDIUM'
    },
    {
      id: 'mock3',
      item: 'ผ้าห่มกันหนาว',
      category: 'CLOTHING',
      quantity: 30,
      unit: 'ผืน',
      requester: 'อบต. หญ้าปล้อง',
      location: 'อ.เมือง',
      status: 'APPROVED', 
      time: '1 ชั่วโมงที่แล้ว',
      urgency: 'LOW'
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

  // Logic การกรองข้อมูล (Search + Category)
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // 1. กรองตามหมวดหมู่
      const matchCategory = selectedCategory === 'ALL' || req.category === selectedCategory;
      
      // 2. กรองตามคำค้นหา (ชื่อของ หรือ สถานที่)
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = 
        req.item.toLowerCase().includes(searchLower) || 
        req.requester.toLowerCase().includes(searchLower);

      return matchCategory && matchSearch;
    });
  }, [requests, selectedCategory, searchQuery]);

  // ฟังก์ชันอัปเดตสถานะ (เหมือนเดิม)
  const handleUpdateStatus = (id: any, newStatus: string) => {
    const updatedRequests = requests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('ems_requests', JSON.stringify(updatedRequests));

    if (newStatus === 'REJECTED') {
        const targetRequest = requests.find(r => r.id === id);
        if (targetRequest) {
            const storedInv = localStorage.getItem('ems_inventory');
            if (storedInv) {
                const inventory = JSON.parse(storedInv);
                let itemIndex = -1;
                if (targetRequest.itemId) {
                    itemIndex = inventory.findIndex((i: any) => i.id === targetRequest.itemId);
                } else {
                    itemIndex = inventory.findIndex((i: any) => i.name === targetRequest.item);
                }
                
                if (itemIndex !== -1) {
                    inventory[itemIndex].stock += targetRequest.quantity;
                    localStorage.setItem('ems_inventory', JSON.stringify(inventory));
                    window.dispatchEvent(new Event('storage'));
                    alert(`ปฏิเสธคำร้องขอ: คืน ${targetRequest.item} จำนวน ${targetRequest.quantity} เข้าคลังแล้ว`);
                }
            }
        }
    } else {
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

  // Helper สำหรับดึงไอคอนตามหมวดหมู่
  const getCategoryIcon = (category: string) => {
      switch(category) {
          case 'FOOD': return <Utensils className="w-5 h-5" />;
          case 'MEDICINE': return <Pill className="w-5 h-5" />;
          case 'CLOTHING': return <Shirt className="w-5 h-5" />;
          default: return <Package className="w-5 h-5" />;
      }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      {/* ปรับ max-width เป็น 7xl เพื่อให้กว้างขึ้นเต็มหน้าจอ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="sticky top-0 bg-[#0B1120]/90 backdrop-blur-xl py-4 z-20 border-b border-slate-800/50 -mx-4 px-4 mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
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

                {/* Search Bar */}
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหารายการ, สถานที่..." 
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Category Filters (Scrollable on mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Filter className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                            selectedCategory === cat.id
                            ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                            : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Grid */}
        <div className="pb-10">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                <Search className="w-16 h-16 mb-4 text-slate-700" />
                <p className="text-lg">ไม่พบรายการคำร้องขอ</p>
                <p className="text-sm">ลองเปลี่ยนหมวดหมู่ หรือคำค้นหา</p>
            </div>
          ) : (
            // เปลี่ยนจาก Flex เป็น Grid เพื่อแสดงผลเต็มหน้าจอ
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRequests.map((req: any) => (
                    <div 
                    key={req.id}
                    className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/30 hover:bg-slate-800/80 transition-all duration-200 shadow-lg"
                    >
                        {/* Top Part: Icon & Info */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-800 border border-slate-700 shrink-0 ${req.urgency === 'HIGH' ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-slate-300'}`}>
                                {getCategoryIcon(req.category)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors truncate pr-2">
                                        {req.item}
                                    </h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap ${getStatusBadge(req.status)}`}>
                                        {getStatusLabel(req.status)}
                                    </span>
                                </div>
                                
                                <p className="text-white font-medium mb-2">
                                    {req.quantity} {req.unit}
                                </p>
                                
                                <div className="space-y-1 text-sm text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-blue-500/70" /> 
                                        <span className="truncate">{req.requester}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-orange-500/70" /> 
                                        <span className="truncate">{req.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Part: Actions */}
                        <div className="pt-4 border-t border-slate-800/50 mt-auto">
                            {req.status === 'PENDING' ? (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                    className="flex-1 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> อนุมัติ
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 text-sm font-medium transition-colors border border-slate-700 hover:border-red-500/30 flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> ปฏิเสธ
                                </button>
                            </div>
                            ) : (
                                <button className="w-full py-2 rounded-lg bg-slate-900/50 text-slate-500 text-sm font-medium border border-slate-800 cursor-not-allowed flex items-center justify-center gap-2">
                                    <MoreVertical className="w-4 h-4" /> ดำเนินการแล้ว
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}