import { Suspense } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-pick-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[430px]">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}
