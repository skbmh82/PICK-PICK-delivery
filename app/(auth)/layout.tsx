export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-pick-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[430px]">
        {children}
      </div>
    </div>
  );
}
