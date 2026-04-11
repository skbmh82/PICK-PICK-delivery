export default function UserLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60dvh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pick-purple to-pick-purple-light flex items-center justify-center shadow-lg shadow-pick-purple/25">
            <span className="text-3xl">🍱</span>
          </div>
          <div className="absolute inset-0 rounded-2xl border-4 border-pick-purple/30 animate-ping" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-pick-purple pick-bounce-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
