import { Search, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ────────────── 카테고리 데이터 ────────────── */
const CATEGORIES = [
  { id: "burger",   label: "버거",     emoji: "🍔", bg: "bg-amber-50",    border: "border-amber-200",   text: "text-amber-800" },
  { id: "korean",   label: "한식",     emoji: "🍚", bg: "bg-orange-50",   border: "border-orange-200",  text: "text-orange-800" },
  { id: "chicken",  label: "치킨",     emoji: "🍗", bg: "bg-yellow-50",   border: "border-yellow-200",  text: "text-yellow-800" },
  { id: "snack",    label: "분식",     emoji: "🍜", bg: "bg-lime-50",     border: "border-lime-200",    text: "text-lime-800" },
  { id: "pork",     label: "돈까스",   emoji: "🥩", bg: "bg-stone-50",    border: "border-stone-200",   text: "text-stone-700" },
  { id: "jokbal",   label: "족발/보쌈", emoji: "🐷", bg: "bg-pink-50",     border: "border-pink-200",    text: "text-pink-800" },
  { id: "stew",     label: "찜/탕",    emoji: "🍲", bg: "bg-red-50",      border: "border-red-200",     text: "text-red-800" },
  { id: "grill",    label: "구이",     emoji: "🔥", bg: "bg-rose-50",     border: "border-rose-200",    text: "text-rose-800" },
  { id: "pizza",    label: "피자",     emoji: "🍕", bg: "bg-orange-50",   border: "border-orange-300",  text: "text-orange-700" },
  { id: "chinese",  label: "중식",     emoji: "🥟", bg: "bg-red-50",      border: "border-red-300",     text: "text-red-700" },
  { id: "japanese", label: "일식",     emoji: "🍱", bg: "bg-violet-50",   border: "border-violet-200",  text: "text-violet-800" },
  { id: "seafood",  label: "회/해물",  emoji: "🦐", bg: "bg-cyan-50",     border: "border-cyan-200",    text: "text-cyan-800" },
  { id: "western",  label: "양식",     emoji: "🥗", bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-800" },
  { id: "coffee",   label: "커피/차",  emoji: "☕", bg: "bg-stone-50",    border: "border-stone-300",   text: "text-stone-800" },
  { id: "dessert",  label: "디저트",   emoji: "🍰", bg: "bg-fuchsia-50",  border: "border-fuchsia-200", text: "text-fuchsia-800" },
  { id: "snacks",   label: "간식",     emoji: "🍿", bg: "bg-indigo-50",   border: "border-indigo-200",  text: "text-indigo-800" },
];

/* ────────────── 서브 컴포넌트 ────────────── */
function SearchBar() {
  return (
    <div className="px-4 pt-4 pb-3">
      <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3.5 border-2 border-pick-border shadow-sm">
        <Search size={18} className="text-pick-purple flex-shrink-0" />
        <span className="text-pick-text-sub text-sm">가게명, 메뉴를 검색해보세요</span>
      </div>
    </div>
  );
}

function LocationBar() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-2">
      <MapPin size={15} className="text-pick-purple" fill="#A855F7" fillOpacity={0.3} />
      <span className="text-pick-text text-sm font-semibold">서울 강남구 역삼동</span>
      <ChevronRight size={14} className="text-pick-text-sub" />
    </div>
  );
}

function CategoryGrid() {
  return (
    <section className="px-4 pt-2 pb-4">
      <h2 className="text-lg font-bold text-pick-text mb-4 px-1">
        무엇을 드시고 싶으세요? 🤔
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/home?category=${cat.id}`}
            className={`
              flex items-center gap-4 px-5 py-5 rounded-3xl border-2
              ${cat.bg} ${cat.border}
              shadow-sm active:scale-95 transition-transform duration-150
            `}
          >
            <span className="text-4xl leading-none">{cat.emoji}</span>
            <span className={`text-base font-bold ${cat.text} leading-tight`}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ────────────── 메인 페이지 ────────────── */
export default function HomePage() {
  return (
    <div className="min-h-full">
      <LocationBar />
      <SearchBar />
      <CategoryGrid />
    </div>
  );
}
