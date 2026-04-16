import { Star, Clock, Bike, ArrowLeft, Frown, Search, Zap, Flame, Megaphone } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import AutoScrollBanner from "./AutoScrollBanner";
import { cookies } from "next/headers";
import { fetchStoresByCategory, searchStores, fetchTopStores, fetchSponsoredStores, type StoreRow, type AdStore } from "@/lib/supabase/stores";
import { CATEGORY_META, getCategoryEmoji } from "@/lib/utils/categoryEmoji";
import SearchBar from "./SearchBar";
import FilterSortBar, { type SortKey } from "./FilterSortBar";
import LoadMoreStores from "./LoadMoreStores";
import LocationBar from "./LocationBar";
import RecentlyViewedStores from "./RecentlyViewedStores";
import NearbyFavorites from "./NearbyFavorites";

/* ────────────── 검색 결과 뷰 ────────────── */
async function SearchResultsView({ query, sort, lat, lng }: { query: string; sort: SortKey; lat?: number | null; lng?: number | null }) {
  const stores = await searchStores(query, sort, lat, lng);

  return (
    <section className="pt-3 pb-4">
      <div className="flex items-center gap-2 mb-3 px-4">
        <Link
          href="/home"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-pick-card border-2 border-pick-border shadow-sm active:scale-95 transition-transform"
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

      <Suspense fallback={null}>
        <FilterSortBar currentSort={sort} />
      </Suspense>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-pick-text-sub px-4">
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
        <div className="flex flex-col gap-4 px-4">
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

/* ────────────── 스폰서 가게 카드 ────────────── */
function SponsoredStoreCard({ store }: { store: AdStore }) {
  const emoji = getCategoryEmoji(store.category);
  return (
    <Link
      href={`/store/${store.id}`}
      className="block bg-white dark:bg-pick-card rounded-3xl border-2 border-amber-200 shadow-sm active:scale-95 transition-transform duration-150 overflow-hidden relative"
    >
      {/* SPONSORED 뱃지 */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
        <Megaphone size={10} />
        AD
      </div>
      <div className="h-36 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
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
      </div>
    </Link>
  );
}

async function SponsoredSection() {
  const sponsored = await fetchSponsoredStores();
  const topAds    = sponsored.filter((s) => s.adType === "top");
  const bannerAds = sponsored.filter((s) => s.adType === "banner");

  if (topAds.length === 0 && bannerAds.length === 0) return null;

  // AdStore → AutoScrollBanner 형식으로 변환
  const adBannerItems = bannerAds.map((s) => ({
    id:       s.adId,
    gradient: s.bannerGradient ?? "from-pick-purple-dark via-pick-purple to-pick-purple-light",
    badge:    "AD 📢",
    badgeBg:  "bg-white/25 text-white",
    title:    s.bannerTitle ?? s.name,
    sub:      s.bannerSub ?? s.description ?? "",
    href:     `/store/${s.id}`,
  }));

  return (
    <>
      {/* 배너 광고 — 자동 슬라이드 */}
      {adBannerItems.length > 0 && (
        <div className="pt-1">
          <AutoScrollBanner items={adBannerItems} />
        </div>
      )}

      {/* 상단 노출 가게 */}
      {topAds.length > 0 && (
        <section className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} className="text-amber-500 fill-amber-500" />
            <h2 className="font-black text-pick-text text-base">광고 가게</h2>
          </div>
          <div className="flex flex-col gap-4">
            {topAds.map((store) => (
              <SponsoredStoreCard key={store.adId} store={store} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ────────────── 프로모션 배너 데이터 ────────────── */
const PROMO_BANNERS = [
  {
    id: "welcome",
    gradient: "from-pick-purple-dark via-pick-purple to-pick-purple-light",
    badge: "쿠폰", badgeBg: "bg-pick-yellow text-white",
    title: "첫 주문 혜택! 🎉",
    sub: "WELCOME50 코드 입력하고\n50 PICK 즉시 지급",
    href: "/wallet",
  },
  {
    id: "pick",
    gradient: "from-amber-500 via-orange-400 to-yellow-400",
    badge: "등급", badgeBg: "bg-white/30 text-white",
    title: "PICK 등급 혜택 ⚡",
    sub: "FOREST 등급 달성 시\n주문금액 3배 적립!",
    href: "/my-pick",
  },
  {
    id: "free",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    badge: "무료배달", badgeBg: "bg-white/30 text-white",
    title: "배달비 무료 쿠폰 🛵",
    sub: "FREESHIP 코드로\n배달비 0원에 주문",
    href: "/wallet",
  },
  {
    id: "referral",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    badge: "초대", badgeBg: "bg-white/30 text-white",
    title: "친구 초대하면 50 PICK 🎁",
    sub: "친구가 첫 주문 완료 시\n나에게도 50 PICK 지급!",
    href: "/my-pick",
  },
];

/* ────────────── 인기 가게 가로 스크롤 ────────────── */
function HotStoreCard({ store }: { store: StoreRow }) {
  const emoji = getCategoryEmoji(store.category);
  return (
    <Link
      href={`/store/${store.id}`}
      className="flex-shrink-0 w-40 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm active:scale-95 transition-transform overflow-hidden"
    >
      <div className="h-24 bg-gradient-to-br from-pick-bg to-pick-border flex items-center justify-center relative">
        {store.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
      </div>
      <div className="px-3 pt-2 pb-3">
        <p className="font-black text-pick-text text-xs leading-snug truncate mb-1">{store.name}</p>
        <div className="flex items-center gap-1 text-[10px] text-pick-text-sub">
          <Star size={9} className="text-pick-yellow fill-pick-yellow flex-shrink-0" />
          <span className="font-bold text-pick-text">{store.rating}</span>
          <span className="mx-0.5">·</span>
          <Bike size={9} className="flex-shrink-0" />
          <span>
            {store.delivery_fee === 0
              ? <span className="text-green-600 font-bold">무료</span>
              : `${store.delivery_fee.toLocaleString()}원`}
          </span>
        </div>
      </div>
    </Link>
  );
}

async function HotStoresSection() {
  const stores = await fetchTopStores(8);
  if (stores.length === 0) return null;

  return (
    <section className="px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={16} className="text-orange-500 fill-orange-500" />
        <h2 className="font-black text-pick-text text-base">지금 인기 가게 🔥</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {stores.map((store) => (
          <HotStoreCard key={store.id} store={store} />
        ))}
      </div>
    </section>
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
      className="block bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm active:scale-95 transition-transform duration-150 overflow-hidden"
    >
      <div className="h-36 bg-gradient-to-br from-pick-bg to-pick-border flex items-center justify-center relative">
        {store.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-7xl">{emoji}</span>
        )}
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
async function StoreListView({
  category, sort, openOnly = false, lat, lng,
}: {
  category: string; sort: SortKey; openOnly?: boolean;
  lat?: number | null; lng?: number | null;
}) {
  const info = CATEGORY_META[category];
  const [{ stores, hasMore }, allSponsored] = await Promise.all([
    fetchStoresByCategory(category, sort, 0, undefined, openOnly, lat, lng),
    fetchSponsoredStores(),
  ]);
  // 해당 카테고리의 상단 노출 광고 가게
  const sponsoredTop = allSponsored.filter(
    (s) => s.adType === "top" && s.category === category
  );
  // 광고 가게 id 제외한 일반 가게
  const sponsoredIds  = new Set(sponsoredTop.map((s) => s.id));
  const regularStores = stores.filter((s) => !sponsoredIds.has(s.id));
  const initialCount  = sponsoredTop.length + regularStores.length;

  return (
    <section className="pt-3 pb-4">
      <div className="flex items-center gap-2 mb-3 px-4">
        <Link
          href="/home"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-pick-card border-2 border-pick-border shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-pick-purple" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{info?.emoji ?? "🍽️"}</span>
          <h2 className="text-lg font-black text-pick-text">{info?.label ?? category}</h2>
          {initialCount > 0 && (
            <span className="text-sm text-pick-text-sub font-medium">{initialCount}개{hasMore ? "+" : ""}</span>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <FilterSortBar currentSort={sort} />
      </Suspense>

      {initialCount === 0 ? (
        <div className="flex flex-col items-center py-16 text-pick-text-sub px-4">
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
        <div className="flex flex-col gap-4 px-4">
          {/* 광고 가게 최상단 */}
          {sponsoredTop.map((store) => (
            <SponsoredStoreCard key={store.adId} store={store} />
          ))}
          {/* 초기 일반 가게 */}
          {regularStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
          {/* 클라이언트 더보기 */}
          <LoadMoreStores
            category={category}
            sort={sort}
            initialOffset={stores.length}
            initialHasMore={hasMore}
            openOnly={openOnly}
            lat={lat}
            lng={lng}
          />
        </div>
      )}
    </section>
  );
}

const VALID_SORTS: SortKey[] = ["rating", "delivery_fee", "min_order", "delivery_time"];

/* ────────────── 메인 페이지 ────────────── */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; open?: string }>;
}) {
  const { category, search, sort: sortParam, open } = await searchParams;
  const sort: SortKey =
    VALID_SORTS.includes(sortParam as SortKey) ? (sortParam as SortKey) : "rating";
  const openOnly = open === "1";

  // 쿠키에서 유저 배달 주소 좌표 읽기 (LocationBar가 설정)
  const cookieStore = await cookies();
  const latCookie   = cookieStore.get("pick-lat")?.value;
  const lngCookie   = cookieStore.get("pick-lng")?.value;
  const userLat     = latCookie  ? parseFloat(latCookie)  : null;
  const userLng     = lngCookie  ? parseFloat(lngCookie)  : null;

  const showSearch   = !!search?.trim();
  const showCategory = !showSearch && !!category;

  return (
    <div className="min-h-full pb-4">
      <LocationBar />
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>

      {showSearch ? (
        <SearchResultsView query={search!.trim()} sort={sort} lat={userLat} lng={userLng} />
      ) : showCategory ? (
        <StoreListView category={category!} sort={sort} openOnly={openOnly} lat={userLat} lng={userLng} />
      ) : (
        <>
          {/* 광고 섹션 (배너 광고 + 상단 노출) */}
          <Suspense fallback={null}>
            <SponsoredSection />
          </Suspense>

          {/* 프로모션 배너 — 자동 슬라이드 */}
          <AutoScrollBanner items={PROMO_BANNERS} />

          {/* 카테고리 그리드 — 배너 바로 아래 */}
          <CategoryGrid />

          {/* 최근 본 가게 */}
          <RecentlyViewedStores />

          {/* 이 주소 근처 즐겨찾기 */}
          <NearbyFavorites />

          {/* 지금 인기 가게 */}
          <Suspense fallback={
            <div className="px-4 py-3">
              <div className="h-5 w-32 bg-gray-100 rounded-full mb-3 animate-pulse" />
              <div className="flex gap-3">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-40 h-40 bg-gray-100 rounded-3xl animate-pulse" />
                ))}
              </div>
            </div>
          }>
            <HotStoresSection />
          </Suspense>
        </>
      )}
    </div>
  );
}
