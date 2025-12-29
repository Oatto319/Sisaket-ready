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
  X,
  Check,
  ChevronRight,
  History
} from 'lucide-react';

export default function RequestPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ems_requests');
    if (stored) {
       try {
         setRequests(JSON.parse(stored));
       } catch (e) {
         setRequests([]);
       }
    }
  }, []);

  const groupedRequests = useMemo(() => {
    const groups: { [key: string]: any } = {};
    const filtered = requests.filter(req => 
        req.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.forEach(req => {
      const hasPending = requests.filter(r => r.requester === req.requester && r.status === 'PENDING').length > 0;
      const groupKey = hasPending ? `active-${req.requester}` : `done-${req.requester}-${req.timestamp || req.time}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          name: req.requester,
          items: [],
          hasPending: hasPending,
          time: req.time
        };
      }
      groups[groupKey].items.push(req);
    });

    return Object.values(groups).sort((a: any, b: any) => {
      if (a.hasPending === b.hasPending) return 0;
      return a.hasPending ? -1 : 1;
    });
  }, [requests, searchQuery]);

  const updateStatus = (idList: any[], newStatus: string) => {
    const updatedRequests = requests.map(req => {
        if (idList.includes(req.id) && req.status === 'PENDING') {
            return { ...req, status: newStatus };
        }
        return req;
    });

    setRequests(updatedRequests);
    localStorage.setItem('ems_requests', JSON.stringify(updatedRequests));

    if (newStatus === 'REJECTED') {
        const storedInv = localStorage.getItem('ems_inventory');
        if (storedInv) {
            const inventory = JSON.parse(storedInv);
            idList.forEach(id => {
                const req = requests.find(r => r.id === id);
                if (req && req.status === 'PENDING') {
                    const itemIndex = inventory.findIndex((inv: any) => inv.id === req.itemId || inv.name === req.item);
                    if (itemIndex !== -1) inventory[itemIndex].stock += req.quantity;
                }
            });
            localStorage.setItem('ems_inventory', JSON.stringify(inventory));
        }
    }
    window.dispatchEvent(new Event('storage'));
  };

  const modalGroup = useMemo(() => {
    const group = groupedRequests.find((g: any) => g.id === selectedGroupId);
    if (!group) return null;

    // แยกของที่รอ กับ ของที่เสร็จแล้ว (ประวัติ)
    return {
      ...group,
      pendingItems: group.items.filter((i: any) => i.status === 'PENDING'),
      historyItems: group.items.filter((i: any) => i.status !== 'PENDING')
    };
  }, [groupedRequests, selectedGroupId]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans p-8 md:p-12 lg:p-16">
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-white">รายการคำร้องขอ</h1>
            </div>
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อศูนย์..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-orange-500/50"
                />
            </div>
        </div>

        {/* List ของแต่ละสถานที่ */}
        <div className="space-y-3">
          {groupedRequests.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                <p>ไม่พบรายการคำร้อง</p>
            </div>
          ) : (
            groupedRequests.map((group: any) => (
              <div 
                key={group.id} 
                className={`transition-all duration-300 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  group.hasPending 
                  ? 'bg-slate-900/60 border-slate-800' 
                  : 'bg-black/40 border-slate-900/50 opacity-60 grayscale-[0.2]'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    group.hasPending ? 'bg-orange-500/10 border-orange-500/20' : 'bg-slate-800 border-slate-700'
                  }`}>
                      <MapPin className={`w-5 h-5 ${group.hasPending ? 'text-orange-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                      <h2 className={`font-bold truncate ${group.hasPending ? 'text-white' : 'text-slate-400'}`}>{group.name}</h2>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        {group.hasPending ? `รออนุมัติ ${group.items.filter((i: any) => i.status === 'PENDING').length} รายการ` : 'ดำเนินการเสร็จสิ้นแล้ว'}
                      </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                      onClick={() => setSelectedGroupId(group.id)}
                      className="text-xs text-blue-400 hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-colors border border-blue-500/10 flex items-center gap-1"
                  >
                      {group.hasPending ? 'ดูรายละเอียด/อนุมัติ' : 'ดูประวัติการเบิก'} <ChevronRight className="w-3 h-3" />
                  </button>
                  
                  {group.hasPending && (
                      <button 
                          onClick={() => updateStatus(group.items.map((i: any) => i.id), 'APPROVED')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                      >
                          <Check className="w-4 h-4" /> อนุมัติทั้งหมด
                      </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Modal รายละเอียด --- */}
      {selectedGroupId && modalGroup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h3 className="font-bold text-white text-base">{modalGroup.name}</h3>
                <p className="text-[11px] text-slate-400">จัดการคำร้องเบิกจ่าย</p>
              </div>
              <button onClick={() => setSelectedGroupId(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              
              {/* รายการที่รอการอนุมัติ */}
              {modalGroup.pendingItems.length > 0 && (
                <div className="space-y-2 mb-6">
                  {modalGroup.pendingItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-700 rounded-xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="text-xl">{item.image || '📦'}</div>
                        <div>
                          <p className="text-sm text-white font-medium">{item.item}</p>
                          <p className="text-xs text-slate-500">จำนวน: <span className="text-orange-400 font-bold">{item.quantity}</span> {item.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateStatus([item.id], 'APPROVED')}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateStatus([item.id], 'REJECTED')}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ส่วนของประวัติการเบิก (รายการที่จัดการแล้ว) */}
              {modalGroup.historyItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 py-2 px-1 border-b border-slate-800/50 mb-3">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ประวัติการเบิกของสถานพักพิงนี้</span>
                  </div>
                  {modalGroup.historyItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-black/30 border border-slate-800/50 rounded-xl opacity-60 grayscale-[0.3]">
                      <div className="flex items-center gap-4">
                        <div className="text-xl grayscale">{item.image || '📦'}</div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium">{item.item}</p>
                          <p className="text-xs text-slate-500">จำนวน: {item.quantity} {item.unit}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded border font-medium ${
                        item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {item.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex gap-3">
               <button 
                onClick={() => setSelectedGroupId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
               >
                 ปิดหน้าต่าง
               </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}