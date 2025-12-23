export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#181b20] p-6 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Sisaket EMS</h2>

      <nav className="space-y-3 text-sm">
        <Menu active label="หน้าหลัก" />
        <Menu label="ศูนย์อำนวยการ" />
        <Menu sub label="รายชื่อศูนย์" />
        <Menu sub label="รายการสิ่งของ" />
        <Menu sub label="คำร้องขอสิ่งของ" />

        <Menu label="ศูนย์พักพิง" />
        <Menu sub label="รายชื่อศูนย์" />
        <Menu sub label="รายการสิ่งของ" />
        <Menu sub label="รายการเบิกจ่าย" />
      </nav>

      <div className="mt-10 text-gray-400 text-sm">ไม่ระบุผู้ใช้</div>
    </aside>
  );
}

function Menu({
  label,
  active,
  sub,
}: {
  label: string;
  active?: boolean;
  sub?: boolean;
}) {
  return (
    <div
      className={`px-3 py-2 rounded-lg cursor-pointer ${
        active
          ? 'bg-purple-600'
          : 'hover:bg-gray-700'
      } ${sub ? 'ml-4 text-gray-400' : ''}`}
    >
      {label}
    </div>
  );
}
