'use client';

const INVENTORY_DATA = [
  { id: 1, name: 'น้ำดื่ม (แพ็ค)', stock: 500, limit: 50, image: '💧', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
  { id: 2, name: 'ข้าวสาร (5 กก.)', stock: 200, limit: 20, image: '🍚', unit: 'กก.', category: 'อาหารและน้ำ' },
  { id: 3, name: 'บะหมี่สำเร็จรูป', stock: 1000, limit: 100, image: '🍜', unit: 'กล่อง', category: 'อาหารและน้ำ' },
  { id: 4, name: 'ปลากระป๋อง', stock: 800, limit: 100, image: '🐟', unit: 'กระป๋อง', category: 'อาหารและน้ำ' },
  { id: 5, name: 'ยาสามัญประจำบ้าน', stock: 150, limit: 10, image: '💊', unit: 'ชุด', category: 'ยารักษาโรค' },
  { id: 6, name: 'ผ้านวม', stock: 300, limit: 50, image: '🛏️', unit: 'ผืน', category: 'เครื่องนุ่งห่ม' },
  { id: 7, name: 'สบู่/สาบซัฟ', stock: 400, limit: 40, image: '🧼', unit: 'ก้อน', category: 'ของใช้ทั่วไป' },
];

export const initializeInventory = () => {
  try {
    const stored = localStorage.getItem('ems_inventory');
    if (!stored) {
      localStorage.setItem('ems_inventory', JSON.stringify(INVENTORY_DATA));
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

export const resetInventory = () => {
  try {
    localStorage.removeItem('ems_inventory');
    localStorage.setItem('ems_inventory', JSON.stringify(INVENTORY_DATA));
    window.dispatchEvent(new Event('storage'));
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

export const getInventory = () => {
  try {
    const stored = localStorage.getItem('ems_inventory');
    if (stored) return JSON.parse(stored);
    return [];
  } catch (error) {
    return [];
  }
};