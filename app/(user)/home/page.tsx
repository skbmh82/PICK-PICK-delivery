import { MapPin, ChevronRight, Star, Clock, Bike, ArrowLeft, Frown, Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { fetchStoresByCategory, searchStores, type StoreRow } from "@/lib/supabase/stores";
import { CATEGORY_META, getCategoryEmoji } from "@/lib/utils/categoryEmoji";
import SearchBar from "./SearchBar";

/* ────────────── 검색 결과 뷰 ────────────── */
async function SearchResultsView({ query }: { query: string }) {
  const stores = await searchStores(query);

  return (
    <section className="px-4 pt-3 pb-4">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/home"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 border-pick-border shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-pick-purple" />
        </Link>
        <div className="flex items-center gap-2">
          <Search size={18} className="text-pick-purple" />
          <h2 className="text-base font-black text-pick-text">
            &ldquo;{query}&rdquo; 검색 결과
          </h2>
          <span className="text-sm text-pick-text-sub font-medium">{stores.length}개</span>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-pick-text-sub">
          <Frown size={48} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">검색 결과가 없어요</p>
          <p className="text-xs mt-1 opacity-70">다른 검색어를 입력해보세요</p>
          <Link
            href="/home"
            className="mt-5 bg-pick-purple text-white text-sm font-bold px-6 py-2.5 rounded-full active:scale-95 transition-all"
          >
            카테고리 보러가기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </section>
  );
}

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

/* ────────────── 위치 바 ────────────── */
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
      <h2 className="text-lg font-bold text-pick-text mb-4 px-1">무엇을 드시고 싶으세요? 🤔</h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/home?category=${cat.id}`}
            className={`flex items-center gap-4 px-5 py-5 rounded-3xl border-2 ${cat.bg} ${cat.border} shadow-sm active:scale-95 transition-transform duration-150`}
          >
            <span className="text-4xl leading-none">{cat.emoji}</span>
            <span className={`text-base font-bold ${cat.text} leading-tight`}>{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ────────────── 가게 카드 (실데이터) ────────────── */
function StoreCard({ store }: { store: StoreRow }) {
  const emoji = getCategoryEmoji(store.category);

  return (
    <Link
      href={`/store/${store.id}`}
      className="block bg-white rounded-3xl border-2 border-pick-border shadow-sm active:scale-95 transition-transform duration-150 overflow-hidden"
    >
      <div className="h-36 bg-gradient-to-br from-pick-bg to-pick-border flex items-center justify-center">
        <span className="text-7xl">{emoji}</span>
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-black text-pick-text text-base leading-snug flex-1">{store.name}</h3>
          <span className="flex-shrink-0 text-xs font-black bg-pick-yellow-light text-pick-yellow-dark px-2.5 py-1 rounded-full">
            +{store.pick_reward_rate}%
          </span>
        </div>
        {store.description && (
          <p className="text-xs text-pick-text-sub mb-2 line-clamp-1">{store.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-pick-text-sub">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-pick-yellow fill-pick-yellow" />
            <span className="font-bold text-pick-text">{store.rating}</span>
            <span>({store.review_count})</span>
          </span>
          <span className="w-0.5 h-3 bg-pick-border" />
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {store.delivery_time}분
          </span>
          <span className="w-0.5 h-3 bg-pick-border" />
          <span className="flex items-center gap-1">
            <Bike size={12} />
            {store.delivery_fee === 0
              ? <span className="font-bold text-green-600">무료배달</span>
              : `${store.delivery_fee.toLocaleString()}원`}
          </span>
        </div>
        <p className="text-xs text-pick-text-sub mt-1.5">
          최소주문 {store.min_order_amount.toLocaleString()}원
        </p>
      </div>
    </Link>
  );
}

/* ────────────── 가게 목록 뷰 (실데이터) ────────────── */
async function StoreListView({ category }: { category: string }) {
  const info = CATEGORY_META[category];
  const stores = await fetchStoresByCategory(category);

  return (
    <section className="px-4 pt-3 pb-4">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/home"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 border-pick-border shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-pick-purple" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{info?.emoji ?? "🍽️"}</span>
          <h2 className="text-lg font-black text-pick-text">{info?.label ?? category}</h2>
          <span className="text-sm text-pick-text-sub font-medium">{stores.length}개</span>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-pick-text-sub">
          <Frown size={48} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">아직 이 카테고리 가게가 없어요</p>
          <p className="text-xs mt-1 opacity-70">다른 카테고리를 선택해보세요!</p>
          <Link
            href="/home"
            className="mt-5 bg-pick-purple text-white text-sm font-bold px-6 py-2.5 rounded-full active:scale-95 transition-all"
          >
            카테고리 보러가기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ────────────── 메인 페이지 ────────────── */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;

  const showSearch   = !!search?.trim();
  const showCategory = !showSearch && !!category;

  return (
    <div className="min-h-full">
      <LocationBar />
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      {showSearch   ? <SearchResultsView query={search!.trim()} /> :
       showCategory ? <StoreListView category={category!} />       :
                      <CategoryGrid />}
    </div>
  );
}
