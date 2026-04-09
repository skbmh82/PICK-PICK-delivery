// 임시 목 데이터 — Supabase 실데이터 연동(Task C) 전까지 사용

export interface MockMenu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // 이모지
  isPopular?: boolean;
  isAvailable?: boolean;
  category: string;
}

export interface MockStore {
  id: string;
  name: string;
  category: string; // CATEGORIES id 와 매핑
  emoji: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number; // 분
  deliveryFee: number;
  minOrderAmount: number;
  pickRewardRate: number; // %
  tags: string[];
  menus: MockMenu[];
}

export const MOCK_STORES: MockStore[] = [
  // ── 한식 ──────────────────────────────────────────
  {
    id: "store-korean-1",
    name: "엄마네 한식뚝배기",
    category: "korean",
    emoji: "🍚",
    rating: 4.8,
    reviewCount: 312,
    deliveryTime: 35,
    deliveryFee: 2000,
    minOrderAmount: 12000,
    pickRewardRate: 2.0,
    tags: ["단골맛집", "정갈한맛", "든든한"],
    menus: [
      { id: "m1", name: "된장찌개 정식", description: "구수한 된장찌개와 3찬 정식", price: 9900, image: "🍲", isPopular: true, isAvailable: true, category: "정식" },
      { id: "m2", name: "김치찌개 정식", description: "돼지고기 넣어 칼칼하게 끓인 김치찌개", price: 9900, image: "🌶️", isPopular: true, isAvailable: true, category: "정식" },
      { id: "m3", name: "제육볶음 정식", description: "매콤달콤 제육볶음에 공기밥", price: 10900, image: "🥩", isAvailable: true, category: "정식" },
      { id: "m4", name: "순두부찌개", description: "부드러운 순두부에 해산물 듬뿍", price: 8900, image: "🫕", isAvailable: true, category: "찌개" },
      { id: "m5", name: "공기밥", description: "추가 공기밥", price: 1000, image: "🍚", isAvailable: true, category: "사이드" },
    ],
  },
  {
    id: "store-korean-2",
    name: "골목 갈비집",
    category: "korean",
    emoji: "🥩",
    rating: 4.6,
    reviewCount: 198,
    deliveryTime: 40,
    deliveryFee: 3000,
    minOrderAmount: 20000,
    pickRewardRate: 1.5,
    tags: ["숯불향", "주말인기", "고기집"],
    menus: [
      { id: "m6", name: "돼지갈비 1인분", description: "양념 돼지갈비 200g, 공기밥 포함", price: 13900, image: "🍖", isPopular: true, isAvailable: true, category: "갈비" },
      { id: "m7", name: "소갈비 1인분", description: "LA갈비 200g, 공기밥 포함", price: 19900, image: "🥩", isAvailable: true, category: "갈비" },
      { id: "m8", name: "냉면", description: "시원한 물냉면", price: 7900, image: "🍜", isAvailable: true, category: "사이드" },
    ],
  },

  // ── 치킨 ──────────────────────────────────────────
  {
    id: "store-chicken-1",
    name: "바삭대장 치킨",
    category: "chicken",
    emoji: "🍗",
    rating: 4.9,
    reviewCount: 541,
    deliveryTime: 25,
    deliveryFee: 2000,
    minOrderAmount: 17000,
    pickRewardRate: 2.5,
    tags: ["바삭바삭", "빠른배달", "인기1위"],
    menus: [
      { id: "m9", name: "후라이드 치킨", description: "바삭한 황금빛 후라이드", price: 17000, image: "🍗", isPopular: true, isAvailable: true, category: "치킨" },
      { id: "m10", name: "양념 치킨", description: "달콤 매콤 양념 치킨", price: 18000, image: "🍗", isPopular: true, isAvailable: true, category: "치킨" },
      { id: "m11", name: "반반 치킨", description: "후라이드 + 양념 반반", price: 18000, image: "🍗", isAvailable: true, category: "치킨" },
      { id: "m12", name: "간장 마늘 치킨", description: "간장 베이스 달콤한 마늘 소스", price: 19000, image: "🧄", isAvailable: true, category: "치킨" },
      { id: "m13", name: "콜라 1.5L", description: "시원한 콜라", price: 2500, image: "🥤", isAvailable: true, category: "음료" },
      { id: "m14", name: "치킨무", description: "시원한 치킨무 추가", price: 500, image: "🫙", isAvailable: true, category: "사이드" },
    ],
  },
  {
    id: "store-chicken-2",
    name: "굽네 오리지날",
    category: "chicken",
    emoji: "🔥",
    rating: 4.5,
    reviewCount: 287,
    deliveryTime: 30,
    deliveryFee: 0,
    minOrderAmount: 18000,
    pickRewardRate: 1.5,
    tags: ["오븐구이", "무배달비", "담백한맛"],
    menus: [
      { id: "m15", name: "오리지날 오븐구이", description: "건강한 오븐구이 치킨", price: 19000, image: "🍗", isPopular: true, isAvailable: true, category: "치킨" },
      { id: "m16", name: "볼케이노 치킨", description: "불닭 소스로 버무린 매운 치킨", price: 20000, image: "🌶️", isAvailable: true, category: "치킨" },
    ],
  },

  // ── 피자 ──────────────────────────────────────────
  {
    id: "store-pizza-1",
    name: "나폴리 피자하우스",
    category: "pizza",
    emoji: "🍕",
    rating: 4.7,
    reviewCount: 163,
    deliveryTime: 35,
    deliveryFee: 2500,
    minOrderAmount: 15000,
    pickRewardRate: 2.0,
    tags: ["화덕피자", "수제도우", "치즈듬뿍"],
    menus: [
      { id: "m17", name: "마르게리따 피자 (M)", description: "토마토 소스 + 모짜렐라 + 바질", price: 16000, image: "🍕", isPopular: true, isAvailable: true, category: "피자" },
      { id: "m18", name: "페퍼로니 피자 (M)", description: "페퍼로니 듬뿍 올린 클래식 피자", price: 17000, image: "🍕", isPopular: true, isAvailable: true, category: "피자" },
      { id: "m19", name: "포테이토 피자 (M)", description: "감자 + 베이컨 + 크림 소스", price: 17000, image: "🥔", isAvailable: true, category: "피자" },
      { id: "m20", name: "치킨 BBQ 피자 (L)", description: "BBQ 소스 + 닭가슴살 + 양파", price: 22000, image: "🍗", isAvailable: true, category: "피자" },
      { id: "m21", name: "갈릭 브레드", description: "버터 마늘 바게트", price: 5000, image: "🥖", isAvailable: true, category: "사이드" },
    ],
  },

  // ── 중식 ──────────────────────────────────────────
  {
    id: "store-chinese-1",
    name: "홍콩반점 0410",
    category: "chinese",
    emoji: "🥟",
    rating: 4.6,
    reviewCount: 429,
    deliveryTime: 30,
    deliveryFee: 1000,
    minOrderAmount: 13000,
    pickRewardRate: 1.5,
    tags: ["짜장면맛집", "빠른배달", "가성비"],
    menus: [
      { id: "m22", name: "짜장면", description: "춘장 소스로 만든 진한 짜장면", price: 7000, image: "🍜", isPopular: true, isAvailable: true, category: "면" },
      { id: "m23", name: "짬뽕", description: "해물 가득 얼큰한 짬뽕", price: 8000, image: "🦐", isPopular: true, isAvailable: true, category: "면" },
      { id: "m24", name: "탕수육 (소)", description: "바삭한 탕수육 소자", price: 13000, image: "🥩", isAvailable: true, category: "요리" },
      { id: "m25", name: "볶음밥", description: "중화 볶음밥", price: 8000, image: "🍳", isAvailable: true, category: "밥" },
      { id: "m26", name: "군만두", description: "바삭한 군만두 6개", price: 5000, image: "🥟", isAvailable: true, category: "사이드" },
    ],
  },

  // ── 일식 ──────────────────────────────────────────
  {
    id: "store-japanese-1",
    name: "스시로 초밥전문점",
    category: "japanese",
    emoji: "🍱",
    rating: 4.8,
    reviewCount: 221,
    deliveryTime: 40,
    deliveryFee: 3000,
    minOrderAmount: 20000,
    pickRewardRate: 2.0,
    tags: ["신선한재료", "프리미엄", "특별한날"],
    menus: [
      { id: "m27", name: "모둠 초밥 12P", description: "신선한 생선 모둠 초밥 12피스", price: 22000, image: "🍣", isPopular: true, isAvailable: true, category: "초밥" },
      { id: "m28", name: "연어 초밥 6P", description: "두툼한 연어 초밥 6피스", price: 14000, image: "🐟", isAvailable: true, category: "초밥" },
      { id: "m29", name: "라멘", description: "진한 돈코츠 라멘", price: 10000, image: "🍜", isAvailable: true, category: "면" },
      { id: "m30", name: "가라아게", description: "바삭한 일본식 치킨 가라아게", price: 9000, image: "🍗", isAvailable: true, category: "사이드" },
    ],
  },

  // ── 분식 ──────────────────────────────────────────
  {
    id: "store-snack-1",
    name: "떡볶이 왕국",
    category: "snack",
    emoji: "🍜",
    rating: 4.7,
    reviewCount: 394,
    deliveryTime: 20,
    deliveryFee: 1500,
    minOrderAmount: 8000,
    pickRewardRate: 2.0,
    tags: ["매콤달콤", "즉석떡볶이", "학교앞맛집"],
    menus: [
      { id: "m31", name: "엽기떡볶이 (1인)", description: "존맛탱 엽기 소스 떡볶이 1인분", price: 8000, image: "🌶️", isPopular: true, isAvailable: true, category: "떡볶이" },
      { id: "m32", name: "순한맛 떡볶이 (1인)", description: "달달한 간장 소스 떡볶이", price: 7500, image: "🍡", isAvailable: true, category: "떡볶이" },
      { id: "m33", name: "튀김 모둠 5종", description: "새우/고구마/야채/오징어/핫도그", price: 6000, image: "🍤", isPopular: true, isAvailable: true, category: "튀김" },
      { id: "m34", name: "순대", description: "따뜻한 순대 1인분", price: 4500, image: "🫙", isAvailable: true, category: "사이드" },
      { id: "m35", name: "컵라면", description: "신라면 컵라면", price: 1500, image: "🍜", isAvailable: true, category: "사이드" },
    ],
  },

  // ── 버거 ──────────────────────────────────────────
  {
    id: "store-burger-1",
    name: "수제버거 브루클린",
    category: "burger",
    emoji: "🍔",
    rating: 4.7,
    reviewCount: 276,
    deliveryTime: 28,
    deliveryFee: 2000,
    minOrderAmount: 12000,
    pickRewardRate: 2.0,
    tags: ["수제버거", "두툼한패티", "감자튀김"],
    menus: [
      { id: "m36", name: "클래식 버거 세트", description: "소고기 패티 + 감자튀김 + 음료", price: 13900, image: "🍔", isPopular: true, isAvailable: true, category: "세트" },
      { id: "m37", name: "더블 치즈버거 세트", description: "더블 패티 + 치즈 듬뿍 + 감자튀김 + 음료", price: 16900, image: "🧀", isPopular: true, isAvailable: true, category: "세트" },
      { id: "m38", name: "치킨 버거", description: "바삭한 치킨 패티 버거", price: 11900, image: "🍗", isAvailable: true, category: "버거" },
      { id: "m39", name: "감자튀김 (L)", description: "바삭한 감자튀김 큰 것", price: 4500, image: "🍟", isAvailable: true, category: "사이드" },
      { id: "m40", name: "콜라", description: "콜라 M사이즈", price: 2000, image: "🥤", isAvailable: true, category: "음료" },
    ],
  },

  // ── 카페·디저트 ────────────────────────────────────
  {
    id: "store-coffee-1",
    name: "카페 픽픽",
    category: "coffee",
    emoji: "☕",
    rating: 4.9,
    reviewCount: 183,
    deliveryTime: 20,
    deliveryFee: 1000,
    minOrderAmount: 7000,
    pickRewardRate: 3.0,
    tags: ["PICK인기", "달달한", "카페음료"],
    menus: [
      { id: "m41", name: "아메리카노 (ICE)", description: "진한 에스프레소 + 얼음", price: 3500, image: "☕", isPopular: true, isAvailable: true, category: "커피" },
      { id: "m42", name: "카페라떼 (ICE)", description: "부드러운 우유 + 에스프레소", price: 4500, image: "🥛", isPopular: true, isAvailable: true, category: "커피" },
      { id: "m43", name: "딸기 스무디", description: "생딸기 가득 스무디", price: 5900, image: "🍓", isAvailable: true, category: "스무디" },
      { id: "m44", name: "크로플", description: "바삭한 크로플 + 크림치즈", price: 5500, image: "🧇", isPopular: true, isAvailable: true, category: "디저트" },
      { id: "m45", name: "치즈케이크", description: "뉴욕식 치즈케이크 1조각", price: 6500, image: "🍰", isAvailable: true, category: "디저트" },
    ],
  },

  // ── 양식 ──────────────────────────────────────────
  {
    id: "store-western-1",
    name: "파스타 이탈리아노",
    category: "western",
    emoji: "🥗",
    rating: 4.6,
    reviewCount: 142,
    deliveryTime: 35,
    deliveryFee: 2500,
    minOrderAmount: 14000,
    pickRewardRate: 1.5,
    tags: ["파스타전문", "크림파스타", "로맨틱"],
    menus: [
      { id: "m46", name: "까르보나라", description: "진한 크림 소스 까르보나라", price: 13900, image: "🍝", isPopular: true, isAvailable: true, category: "파스타" },
      { id: "m47", name: "아라비아따", description: "토마토 + 페페론치노 매운 파스타", price: 12900, image: "🍅", isAvailable: true, category: "파스타" },
      { id: "m48", name: "리조또", description: "버섯 크림 리조또", price: 14900, image: "🍚", isAvailable: true, category: "리조또" },
      { id: "m49", name: "시저 샐러드", description: "로메인 + 크루통 + 시저 드레싱", price: 9900, image: "🥗", isAvailable: true, category: "샐러드" },
    ],
  },

  // ── 돈까스 ────────────────────────────────────────
  {
    id: "store-pork-1",
    name: "정통 돈까스 본점",
    category: "pork",
    emoji: "🥩",
    rating: 4.8,
    reviewCount: 308,
    deliveryTime: 30,
    deliveryFee: 2000,
    minOrderAmount: 10000,
    pickRewardRate: 2.0,
    tags: ["두툼한돈까스", "수제소스", "든든한"],
    menus: [
      { id: "m50", name: "등심 돈까스", description: "두툼한 등심 돈까스 + 공기밥 + 된장국", price: 11900, image: "🥩", isPopular: true, isAvailable: true, category: "돈까스" },
      { id: "m51", name: "치즈 돈까스", description: "등심 돈까스 위에 체다치즈 듬뿍", price: 13900, image: "🧀", isPopular: true, isAvailable: true, category: "돈까스" },
      { id: "m52", name: "새우 튀김 정식", description: "왕새우튀김 3마리 + 공기밥", price: 14900, image: "🦐", isAvailable: true, category: "튀김" },
    ],
  },
];

// 카테고리 ID → 표시명 매핑
export const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  burger:   { label: "버거",      emoji: "🍔" },
  korean:   { label: "한식",      emoji: "🍚" },
  chicken:  { label: "치킨",      emoji: "🍗" },
  snack:    { label: "분식",      emoji: "🍜" },
  pork:     { label: "돈까스",    emoji: "🥩" },
  jokbal:   { label: "족발/보쌈", emoji: "🐷" },
  stew:     { label: "찜/탕",     emoji: "🍲" },
  grill:    { label: "구이",      emoji: "🔥" },
  pizza:    { label: "피자",      emoji: "🍕" },
  chinese:  { label: "중식",      emoji: "🥟" },
  japanese: { label: "일식",      emoji: "🍱" },
  seafood:  { label: "회/해물",   emoji: "🦐" },
  western:  { label: "양식",      emoji: "🥗" },
  coffee:   { label: "커피/차",   emoji: "☕" },
  dessert:  { label: "디저트",    emoji: "🍰" },
  snacks:   { label: "간식",      emoji: "🍿" },
};

export function getStoresByCategory(category: string): MockStore[] {
  return MOCK_STORES.filter((s) => s.category === category);
}

export function getStoreById(id: string): MockStore | undefined {
  return MOCK_STORES.find((s) => s.id === id);
}
