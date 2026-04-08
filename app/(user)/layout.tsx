import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="app-shell">
      <Header pickBalance={0} />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
