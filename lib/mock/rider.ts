// 라이더 대시보드용 목 데이터

export type DeliveryStatus =
  | "waiting"    // 배달 요청 수락 대기
  | "accepted"   // 수락 (픽업 이동 중)
  | "picked_up"  // 픽업 완료 (배달 중)
  | "delivered"  // 배달 완료
  | "rejected";  // 거절

export interface MockDelivery {
  id: string;
  storeName: string;
  storeEmoji: string;
  storeAddress: string;
  customerAddress: string;
  items: string;         // 메뉴 요약 텍스트
  totalAmount: number;
  pickEarning: number;   // 라이더 PICK 수익
  distance: string;      // "1.2km"
  estimatedMinutes: number;
  status: DeliveryStatus;
  requestedAt: string;   // HH:MM
}

export const MOCK_DELIVERIES: MockDelivery[] = [
  {
    id: "del-001",
    storeName: "바삭대장 치킨",
    storeEmoji: "🍗",
    storeAddress: "서울 강남구 역삼동 123-45",
    customerAddress: "서울 강남구 삼성동 456-78 (3층)",
    items: "후라이드 치킨 x1, 콜라 1.5L x1",
    totalAmount: 19500,
    pickEarning: 2500,
    distance: "1.4km",
    estimatedMinutes: 12,
    status: "waiting",
    requestedAt: "18:42",
  },
  {
    id: "del-002",
    storeName: "떡볶이 왕국",
    storeEmoji: "🍜",
    storeAddress: "서울 강남구 역삼동 678-90",
    customerAddress: "서울 강남구 논현동 234-56 (빌라 101호)",
    items: "엽기떡볶이 x1, 튀김 모둠 x1",
    totalAmount: 14000,
    pickEarning: 2000,
    distance: "0.9km",
    estimatedMinutes: 8,
    status: "waiting",
    requestedAt: "18:45",
  },
  {
    id: "del-003",
    storeName: "홍콩반점 0410",
    storeEmoji: "🥟",
    storeAddress: "서울 강남구 압구정동 567-89",
    customerAddress: "서울 강남구 청담동 234-56 (아파트 1203호)",
    items: "짜장면 x2, 탕수육(소) x1",
    totalAmount: 27000,
    pickEarning: 3000,
    distance: "2.1km",
    estimatedMinutes: 18,
    status: "accepted",
    requestedAt: "18:30",
  },
  {
    id: "del-004",
    storeName: "수제버거 브루클린",
    storeEmoji: "🍔",
    storeAddress: "서울 강남구 삼성동 901-23",
    customerAddress: "서울 강남구 대치동 123-45 (오피스텔 805호)",
    items: "더블 치즈버거 세트 x2",
    totalAmount: 33800,
    pickEarning: 3500,
    distance: "1.8km",
    estimatedMinutes: 15,
    status: "delivered",
    requestedAt: "17:50",
  },
  {
    id: "del-005",
    storeName: "카페 픽픽",
    storeEmoji: "☕",
    storeAddress: "서울 강남구 논현동 234-56",
    customerAddress: "서울 강남구 역삼동 345-67 (스타트업 사무실)",
    items: "아메리카노 x3, 크로플 x2",
    totalAmount: 21500,
    pickEarning: 2200,
    distance: "0.7km",
    estimatedMinutes: 7,
    status: "delivered",
    requestedAt: "16:20",
  },
];

// 오늘 수익 요약
export const TODAY_RIDER_SUMMARY = {
  completed:    2,
  inProgress:   1,
  totalEarning: 5700,  // PICK
  totalDistance: "5.2km",
};

// 주간 수익 데이터
export const WEEKLY_RIDER_EARNINGS = [
  { day: "월", pick: 18500, count: 7 },
  { day: "화", pick: 24000, count: 9 },
  { day: "수", pick: 21000, count: 8 },
  { day: "목", pick: 31500, count: 12 },
  { day: "금", pick: 42000, count: 16 },
  { day: "토", pick: 58000, count: 22 },
  { day: "오늘", pick: 5700, count: 2 },
];

// 정산 내역
export const RIDER_SETTLEMENT_HISTORY = [
  { date: "2026.03.31", pick: 195000, status: "완료" },
  { date: "2026.02.28", pick: 178000, status: "완료" },
  { date: "2026.01.31", pick: 212000, status: "완료" },
];
