export default function RootLoading() {
  return (
    <div className="min-h-dvh bg-pick-bg flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* 로고 */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pick-purple to-pick-purple-light flex items-center justify-center shadow-xl shadow-pick-purple/30">
            <span className="text-4xl">🍱</span>
          </div>
          <div className="absolute inset-0 rounded-3xl border-4 border-pick-purple/30 animate-ping" />
        </div>

        <p className="font-black text-pick-purple text-2xl tracking-wide" style={{ fontFamily: "'Jua', 'Noto Sans KR', sans-serif" }}>
          PICK PICK
        </p>

        {/* 도트 인디케이터 */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-pick-purple pick-bounce-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
