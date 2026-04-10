export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[430px] mx-auto min-h-screen bg-white">
        {children}
      </div>
    </div>
  );
}
