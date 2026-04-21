import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 750,
          height: 1500,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg, #1a0533 0%, #3b0764 30%, #4c1d95 60%, #1a0533 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* 배경 장식 원 */}
        <div style={{
          position: "absolute", width: 600, height: 600,
          borderRadius: "50%",
          border: "1px solid rgba(168,85,247,0.2)",
          top: -200, right: -200, display: "flex",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400,
          borderRadius: "50%",
          background: "rgba(217,119,6,0.08)",
          bottom: 200, left: -100, display: "flex",
        }} />

        {/* ── 상단 헤더 ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 80,
          paddingBottom: 40,
          gap: 12,
        }}>
          {/* 로고 배지 */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 90, height: 90, borderRadius: "50%",
            background: "linear-gradient(135deg, #6B21A8, #9333ea)",
            boxShadow: "0 0 40px rgba(147,51,234,0.6)",
          }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: "#FCD34D", fontFamily: "serif" }}>π</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: "white", letterSpacing: -2, display: "flex" }}>
              PICK PICK
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#FCD34D", letterSpacing: 8, display: "flex" }}>
              픽  픽  배달앱
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 999, paddingLeft: 20, paddingRight: 20,
            paddingTop: 8, paddingBottom: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            marginTop: 8,
          }}>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", display: "flex" }}>🛵</span>
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 600, display: "flex" }}>
              Pi 코인으로 주문하고 적립하는 스마트 배달
            </span>
          </div>
        </div>

        {/* ── 앱 화면 목업 ── */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          paddingLeft: 40, paddingRight: 40,
          marginBottom: 50,
        }}>
          <div style={{
            width: 320, height: 580,
            borderRadius: 40,
            background: "linear-gradient(180deg, #FAF5FF 0%, #ffffff 100%)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 4px rgba(168,85,247,0.4)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* 상태바 */}
            <div style={{
              height: 28, background: "#4c1d95",
              display: "flex", alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)", display: "flex" }} />
            </div>

            {/* 앱 헤더 */}
            <div style={{
              background: "linear-gradient(135deg, #4c1d95, #6B21A8)",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "flex" }}>안녕하세요 👋</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: "white", display: "flex" }}>PICK PICK</span>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <span style={{ fontSize: 12, color: "#FCD34D", fontWeight: 700, display: "flex" }}>π 1,250</span>
              </div>
            </div>

            {/* 검색바 */}
            <div style={{
              margin: "12px 16px",
              background: "#f3e8ff",
              borderRadius: 20,
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 12, color: "#9ca3af", display: "flex" }}>🔍</span>
              <span style={{ fontSize: 11, color: "#9ca3af", display: "flex" }}>맛있는 음식을 검색해보세요</span>
            </div>

            {/* 카테고리 그리드 */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              padding: "0 16px",
              marginBottom: 8,
            }}>
              {[
                { emoji: "🍗", name: "치킨", bg: "#fef3c7" },
                { emoji: "🍕", name: "피자", bg: "#fce7f3" },
                { emoji: "🍱", name: "일식", bg: "#e0f2fe" },
                { emoji: "🍚", name: "한식", bg: "#dcfce7" },
                { emoji: "🥟", name: "중식", bg: "#fdf2f8" },
                { emoji: "☕", name: "카페", bg: "#fef9c3" },
              ].map((cat) => (
                <div key={cat.name} style={{
                  width: 82, height: 64,
                  background: cat.bg,
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}>
                  <span style={{ fontSize: 22, display: "flex" }}>{cat.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#374151", display: "flex" }}>{cat.name}</span>
                </div>
              ))}
            </div>

            {/* Pi 결제 배너 */}
            <div style={{
              margin: "8px 16px",
              background: "linear-gradient(135deg, #6B21A8, #D97706)",
              borderRadius: 16,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", display: "flex" }}>Pi로 결제하고</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: "white", display: "flex" }}>PICK 적립 🎁</span>
              </div>
              <span style={{ fontSize: 24, display: "flex" }}>π</span>
            </div>
          </div>
        </div>

        {/* ── 기능 카드 3개 ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          paddingLeft: 50, paddingRight: 50,
        }}>
          {[
            { icon: "π", title: "Pi 코인 결제", desc: "Pi Network 코인으로\n간편하게 음식 주문", color: "#FCD34D", bg: "rgba(217,119,6,0.15)" },
            { icon: "💜", title: "PICK 토큰 적립", desc: "주문할 때마다\nPICK 토큰이 쌓인다", color: "#a855f7", bg: "rgba(107,33,168,0.2)" },
            { icon: "🛵", title: "실시간 배달 추적", desc: "라이더 위치를\n지도로 실시간 확인", color: "#34d399", bg: "rgba(16,185,129,0.15)" },
          ].map((item) => (
            <div key={item.title} style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: item.bg,
              borderRadius: 24,
              padding: "20px 24px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{
                width: 56, height: 56,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}>{item.icon}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: item.color, display: "flex" }}>{item.title}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, display: "flex", whiteSpace: "pre" }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 하단 CTA ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "auto",
          paddingBottom: 60,
          paddingTop: 40,
          gap: 12,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "linear-gradient(135deg, #D97706, #FCD34D)",
            borderRadius: 999,
            paddingLeft: 40, paddingRight: 40,
            paddingTop: 18, paddingBottom: 18,
            boxShadow: "0 0 30px rgba(217,119,6,0.5)",
          }}>
            <span style={{ fontSize: 18, display: "flex" }}>π</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#1a0533", display: "flex" }}>
              Pi Browser에서 시작하기
            </span>
          </div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", display: "flex" }}>
            pick-pick-delivery.vercel.app
          </span>
        </div>
      </div>
    ),
    { width: 750, height: 1500 }
  );
}
