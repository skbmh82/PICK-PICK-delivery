import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import InstallPrompt from "@/components/pwa/InstallPrompt";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="app-shell">
      <Header />
      <main className="pb-20">{children}</main>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
