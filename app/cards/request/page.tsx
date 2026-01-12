'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Search, CheckCircle, XCircle, Clock, MapPin, 
  Package, X, Check, ChevronRight, History, Lock, LogOut,
  ShieldCheck, AlertCircle, Inbox
} from 'lucide-react';
import { useAuth } from '../../../lib/useAuth';

export default function RequestPage() {
  const router = useRouter();
  const { user, logout, isAdmin, isLoading } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    const stored = localStorage.getItem('ems_requests');
    if (stored) {
      try { setRequests(JSON.parse(stored)); } catch (e) { setRequests([]); }
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

    return Object.values(groups).sort((a: any, b: any) => (a.hasPending === b.hasPending ? 0 : a.hasPending ? -1 : 1));
  }, [requests, searchQuery]);

  const updateStatus = (idList: any[], newStatus: string) => {
    if (!isAdmin) {
      alert('คุณไม่มีสิทธิ์ในการดำเนินการนี้ (Admin Only)');
      return;
    }
    const updatedRequests = requests.map(req => (idList.includes(req.id) && req.status === 'PENDING') ? { ...req, status: newStatus } : req);
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
    return group ? { ...group, pendingItems: group.items.filter((i: any) => i.status === 'PENDING'), historyItems: group.items.filter((i: any) => i.status !== 'PENDING') } : null;
  }, [groupedRequests, selectedGroupId]);

  if (isLoading || !user) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-blue-50/50 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">รายการคำร้องเบิกจ่าย</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${isAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                  {isAdmin ? <ShieldCheck size={12} /> : <Lock size={12} />} {isAdmin ? 'Administrator' : 'Staff'}
                </span>
                <span className="text-xs font-bold text-slate-400">ผู้ใช้งาน: {user.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ค้นหาศูนย์หรือรายการ..." 
                className="bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none w-64 focus:border-blue-400 transition-all"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => { logout(); router.push('/login'); }} className="p-2.5 rounded-xl bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 transition-colors shadow-sm">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Banner for Staff */}
        {!isAdmin && (
          <div className="mb-8 p-5 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-widest">Read-Only Mode</p>
                <p className="text-xs opacity-80 font-bold">บัญชีเจ้าหน้าที่สามารถเรียกดูข้อมูลได้เท่านั้น ไม่สามารถอนุมัติรายการได้</p>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {groupedRequests.length === 0 ? (
            <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
              <Inbox size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest">ไม่พบรายการคำร้องขอในขณะนี้</p>
            </div>
          ) : (
            groupedRequests.map((group: any) => (
              <div key={group.id} className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[2.5rem] bg-white border transition-all duration-300 ${group.hasPending ? 'border-amber-200 shadow-xl shadow-amber-900/5' : 'border-slate-100 opacity-70 grayscale-[0.5]'}`}>
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${group.hasPending ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                    {group.hasPending ? <Clock className="w-7 h-7 animate-pulse" /> : <CheckCircle className="w-7 h-7" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{group.name}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${group.hasPending ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {group.hasPending ? `รอการตรวจสอบ ${group.items.filter((i: any) => i.status === 'PENDING').length} รายการ` : 'ดำเนินการเสร็จสิ้น'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-0 md:pl-0">
                  <button onClick={() => setSelectedGroupId(group.id)} className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 font-black text-xs hover:bg-slate-100 transition-all border border-slate-100">
                    ดูรายละเอียด
                  </button>
                  {group.hasPending && isAdmin && (
                    <button 
                      onClick={() => updateStatus(group.items.map((i: any) => i.id), 'APPROVED')}
                      className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
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

      {/* Modal Detail View */}
      {selectedGroupId && modalGroup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100"><MapPin size={24} /></div>
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">{modalGroup.name}</h3>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Clock size={12} /> {modalGroup.hasPending ? 'มีรายการรอการอนุมัติ' : 'ประวัติการทำรายการ'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedGroupId(null)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              {/* Pending Section */}
              {modalGroup.pendingItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    <h4 className="text-[11px] font-black uppercase text-amber-600 tracking-widest">รายการรออนุมัติ</h4>
                  </div>
                  <div className="grid gap-3">
                    {modalGroup.pendingItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-5 bg-amber-50/50 border border-amber-100 rounded-[1.8rem]">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{item.image || '📦'}</span>
                          <div>
                            <p className="text-sm font-black text-slate-800">{item.item}</p>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-tighter">จำนวน: {item.quantity.toLocaleString()} {item.unit}</p>
                          </div>
                        </div>
                        {isAdmin ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateStatus([item.id], 'APPROVED')} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"><Check size={20} /></button>
                            <button onClick={() => updateStatus([item.id], 'REJECTED')} className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all"><X size={20} /></button>
                          </div>
                        ) : <Lock size={16} className="text-slate-300 mx-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History Section */}
              {modalGroup.historyItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-slate-300 rounded-full" />
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">ประวัติการเบิกจ่าย</h4>
                  </div>
                  <div className="grid gap-3 opacity-60">
                    {modalGroup.historyItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[1.8rem]">
                        <div className="flex items-center gap-4 grayscale">
                          <span className="text-2xl">{item.image || '📦'}</span>
                          <div>
                            <p className="text-sm font-black text-slate-600">{item.item}</p>
                            <p className="text-xs font-bold text-slate-400">จำนวน: {item.quantity} {item.unit}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${item.status === 'APPROVED' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-rose-500 border-rose-100 bg-rose-50'}`}>
                          {item.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50/80 border-t border-slate-100">
              <button onClick={() => setSelectedGroupId(null)} className="w-full py-4 rounded-[1.5rem] bg-white border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-100 transition-all">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
      `}</style>
    </div>
  );
}