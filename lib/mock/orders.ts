// 사장님 대시보드용 목 주문 데이터

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "delivering"
  | "delivered"
  | "cancelled";

export interface MockOrderItem {
  name: string;
  quantity: number;
  price: number;
  options?: string;
}

export interface MockOrder {
  id: string;
  customerName: string;
  items: MockOrderItem[];
  totalAmount: number;
  deliveryFee: number;
  pickUsed: number;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryNote: string;
  createdAt: string; // HH:MM 형식 (오늘 기준)
  estimatedTime: number; // 분
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "order-001",
    customerName: "김민준",
    items: [
      { name: "후라이드 치킨", quantity: 1, price: 17000 },
      { name: "콜라 1.5L", quantity: 1, price: 2500 },
    ],
    totalAmount: 19500,
    deliveryFee: 2000,
    pickUsed: 500,
    status: "pending",
    deliveryAddress: "서울 강남구 역삼동 123-45",
    deliveryNote: "문 앞에 놔주세요",
    createdAt: "18:32",
    estimatedTime: 25,
  },
  {
    id: "order-002",
    customerName: "이서연",
    items: [
      { name: "양념 치킨", quantity: 1, price: 18000 },
      { name: "치킨무", quantity: 2, price: 1000 },
    ],
    totalAmount: 19000,
    deliveryFee: 2000,
    pickUsed: 0,
    status: "pending",
    deliveryAddress: "서울 강남구 삼성동 456-78",
    deliveryNote: "빨리 부탁드려요!",
    createdAt: "18:45",
    estimatedTime: 25,
  },
  {
    id: "order-003",
    customerName: "박도윤",
    items: [
      { name: "반반 치킨", quantity: 1, price: 18000 },
    ],
    totalAmount: 18000,
    deliveryFee: 2000,
    pickUsed: 1000,
    status: "preparing",
    deliveryAddress: "서울 강남구 논현동 789-01",
    deliveryNote: "",
    createdAt: "18:10",
    estimatedTime: 10,
  },
  {
    id: "order-004",
    customerName: "최지우",
    items: [
      { name: "간장 마늘 치킨", quantity: 1, price: 19000 },
      { name: "콜라 1.5L", quantity: 2, price: 5000 },
    ],
    totalAmount: 24000,
    deliveryFee: 2000,
    pickUsed: 2000,
    status: "ready",
    deliveryAddress: "서울 강남구 청담동 234-56",
    deliveryNote: "인터폰 누르지 마세요",
    createdAt: "17:55",
    estimatedTime: 0,
  },
  {
    id: "order-005",
    customerName: "정하은",
    items: [
      { name: "후라이드 치킨", quantity: 2, price: 34000 },
    ],
    totalAmount: 34000,
    deliveryFee: 0,
    pickUsed: 0,
    status: "delivered",
    deliveryAddress: "서울 강남구 압구정동 567-89",
    deliveryNote: "",
    createdAt: "16:30",
    estimatedTime: 0,
  },
  {
    id: "order-006",
    customerName: "강민서",
    items: [
      { name: "양념 치킨", quantity: 1, price: 18000 },
      { name: "치킨무", quantity: 1, price: 500 },
    ],
    totalAmount: 18500,
    deliveryFee: 2000,
    pickUsed: 500,
    status: "delivered",
    deliveryAddress: "서울 강남구 대치동 890-12",
    deliveryNote: "감사합니다",
    createdAt: "15:20",
    estimatedTime: 0,
  },
  {
    id: "order-007",
    customerName: "윤지호",
    items: [
      { name: "반반 치킨", quantity: 1, price: 18000 },
    ],
    totalAmount: 18000,
    deliveryFee: 2000,
    pickUsed: 0,
    status: "cancelled",
    deliveryAddress: "서울 강남구 역삼동 345-67",
    deliveryNote: "",
    createdAt: "14:10",
    estimatedTime: 0,
  },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    "신규 주문",
  confirmed:  "주문 확인",
  preparing:  "조리 중",
  ready:      "조리 완료",
  picked_up:  "픽업 완료",
  delivering: "배달 중",
  delivered:  "배달 완료",
  cancelled:  "취소됨",
};

// 오늘 매출 요약 (목 데이터)
export const TODAY_SUMMARY = {
  newOrders:      2,   // pending
  inProgress:     2,   // confirmed + preparing + ready
  completed:      2,   // delivered
  cancelled:      1,
  totalRevenue:   52500,  // 완료된 주문 합산 (PICK 차감 후)
  pickEarned:     525,    // 적립된 PICK (1%)
};

// 주간 매출 목 데이터 (최근 7일)
export const WEEKLY_REVENUE = [
  { day: "월", amount: 87000 },
  { day: "화", amount: 124000 },
  { day: "수", amount: 95000 },
  { day: "목", amount: 143000 },
  { day: "금", amount: 210000 },
  { day: "토", amount: 285000 },
  { day: "오늘", amount: 52500 },
];
