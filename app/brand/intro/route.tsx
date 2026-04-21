import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 400,
          height: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a0533 0%, #3b0764 40%, #6B21A8 75%, #9333ea 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 에너지 링 */}
        <div style={{
          position: "absolute", width: 500, height: 500,
          borderRadius: "50%",
          border: "2px solid rgba(168,85,247,0.3)",
          top: -80, left: -80,
          display: "flex",
        }} />
        <div style={{
          position: "absolute", width: 350, height: 350,
          borderRadius: "50%",
          border: "1px solid rgba(217,119,6,0.4)",
          top: 160, left: 120,
          display: "flex",
        }} />

        {/* 대각선 빛줄기 */}
        <div style={{
          position: "absolute",
          width: 3, height: 300,
          background: "linear-gradient(to bottom, transparent, rgba(252,211,77,0.6), transparent)",
          transform: "rotate(45deg)",
          top: -50, left: 60,
          display: "flex",
        }} />
        <div style={{
          position: "absolute",
          width: 2, height: 250,
          background: "linear-gradient(to bottom, transparent, rgba(168,85,247,0.5), transparent)",
          transform: "rotate(-30deg)",
          top: 30, left: 280,
          display: "flex",
        }} />
        <div style={{
          position: "absolute",
          width: 1, height: 200,
          background: "linear-gradient(to bottom, transparent, rgba(252,211,77,0.4), transparent)",
          transform: "rotate(60deg)",
          top: 200, left: 20,
          display: "flex",
        }} />

        {/* π 심볼 — 배경 대형 */}
        <div style={{
          position: "absolute",
          fontSize: 280,
          fontWeight: 900,
          color: "rgba(255,255,255,0.04)",
          top: -30, left: 60,
          display: "flex",
          lineHeight: 1,
          fontFamily: "serif",
        }}>π</div>

        {/* 중앙 컨텐츠 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          gap: 0,
        }}>
          {/* π 배지 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64, height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #D97706, #FCD34D)",
            marginBottom: 12,
            boxShadow: "0 0 30px rgba(217,119,6,0.8), 0 0 60px rgba(217,119,6,0.4)",
          }}>
            <span style={{
              fontSize: 32, fontWeight: 900, color: "#1a0533",
              fontFamily: "serif", lineHeight: 1,
            }}>π</span>
          </div>

          {/* PICK PICK 텍스트 */}
          <div style={{
            fontSize: 52,
            fontWeight: 900,
            color: "white",
            letterSpacing: -1,
            lineHeight: 1,
            textShadow: "0 0 40px rgba(168,85,247,0.8)",
            display: "flex",
          }}>PICK</div>
          <div style={{
            fontSize: 52,
            fontWeight: 900,
            background: "linear-gradient(90deg, #FCD34D, #D97706)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: -1,
            lineHeight: 1,
            marginTop: -4,
            display: "flex",
          }}>PICK</div>

          {/* 픽픽 한글 */}
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            marginTop: 8,
            letterSpacing: 6,
            display: "flex",
          }}>픽  픽</div>

          {/* 태그라인 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 999,
            paddingLeft: 16, paddingRight: 16,
            paddingTop: 6, paddingBottom: 6,
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", display: "flex" }}>🛵</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600, display: "flex" }}>
              Pi로 주문하는 배달앱
            </span>
          </div>
        </div>

        {/* 하단 글로우 */}
        <div style={{
          position: "absolute",
          bottom: -20,
          width: 300, height: 100,
          borderRadius: "50%",
          background: "rgba(217,119,6,0.3)",
          filter: "blur(30px)",
          display: "flex",
        }} />
      </div>
    ),
    { width: 400, height: 400 }
  );
}
