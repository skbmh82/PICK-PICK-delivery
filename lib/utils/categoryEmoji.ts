// 카테고리 ID → 이모지/한글명 매핑 (DB에는 이모지가 없으므로 클라이언트에서 매핑)
export const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
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

export function getCategoryEmoji(category: string): string {
  return CATEGORY_META[category]?.emoji ?? "🍽️";
}

// 메뉴 카테고리 → 이모지
export const MENU_EMOJI: Record<string, string> = {
  치킨: "🍗", 정식: "🍱", 찌개: "🫕", 갈비: "🍖", 면: "🍜",
  피자: "🍕", 요리: "🥘", 밥: "🍚", 초밥: "🍣", 떡볶이: "🌶️",
  튀김: "🍤", 버거: "🍔", 세트: "🎁", 커피: "☕", 스무디: "🥤",
  디저트: "🍰", 파스타: "🍝", 샐러드: "🥗", 돈까스: "🥩",
  사이드: "🍟", 음료: "🥤",
};

export function getMenuEmoji(category: string, name: string): string {
  // 메뉴 이름 키워드로 더 정확한 이모지 추출
  const nameMap: [string, string][] = [
    ["콜라", "🥤"], ["치킨무", "🫙"], ["공기밥", "🍚"], ["순대", "🫙"],
    ["만두", "🥟"], ["라멘", "🍜"], ["냉면", "🍜"], ["볶음밥", "🍳"],
    ["갈릭", "🥖"], ["크로플", "🧇"], ["케이크", "🍰"], ["스무디", "🍓"],
    ["라떼", "🥛"], ["아메리카노", "☕"], ["버거", "🍔"], ["감자튀김", "🍟"],
    ["샐러드", "🥗"], ["연어", "🐟"], ["가라아게", "🍗"],
  ];
  for (const [keyword, emoji] of nameMap) {
    if (name.includes(keyword)) return emoji;
  }
  return MENU_EMOJI[category] ?? "🍽️";
}
