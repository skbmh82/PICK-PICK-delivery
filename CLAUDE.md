@AGENTS.md
# CLAUDE.md — PICK PICK 배달앱 프로젝트

> 이 파일은 Claude(AI 코딩 어시스턴트)가 본 프로젝트의 구조, 목적, 규칙, 기술 스택을 이해하기 위한 핵심 참조 문서입니다.
> 코드를 작성하거나 수정하기 전에 반드시 이 파일 전체를 숙지하세요.

---

## 1. 프로젝트 개요 (Project Overview)

| 항목 | 내용 |
|------|------|
| **앱 이름** | PICK PICK (픽픽) |
| **플랫폼** | 한국형 배달 앱 (Web/PWA) |
| **목적** | 소비자가 음식을 주문하고, 자체 PICK 토큰으로 결제·적립할 수 있는 배달 플랫폼 |
| **타겟 사용자** | 일반 소비자(User) / 가맹점 사장님(Owner) / 배달 라이더(Rider) |
| **MVP 목표** | 3역할(사용자·사장님·라이더) 동시 지원, 자체 PICK 토큰 지갑 |
| **Pi Network 연동** | ⚠️ 추후 Mainnet 개방 후 별도 추가 예정 — 현재 미구현 |

---

## 2. 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **언어**: TypeScript (strict mode)
- **스타일링**: Tailwind CSS (브랜드 컬러 기반 커스텀 테마)
- **상태 관리**: Zustand (전역) + TanStack Query (서버 상태)
- **폼 관리**: React Hook Form + Zod (유효성 검사)
- **지도**: Kakao Maps SDK (카카오맵 API) — 한국 주소 정확도 최우선
- **실시간**: Supabase Realtime (주문 상태 실시간 업데이트)
- **푸시 알림**: Firebase Cloud Messaging (FCM)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes (App Router Route Handlers)
- **ORM**: Prisma (Supabase PostgreSQL 연결)
- **인증**: Supabase Auth (이메일/소셜 로그인)
- **파일 저장**: Supabase Storage (메뉴 이미지, 프로필 사진 등)
- **작업 큐**: (향후) BullMQ + Redis — 알림, 토큰 정산 배치

### Database
- **주 DB**: Supabase PostgreSQL
- **실시간**: Supabase Realtime (Postgres Changes)
- **캐시**: (향후) Redis — 인기 메뉴, 가게 목록 캐싱

### 토큰 / 결제
- **PICK 토큰**: 앱 내 자체 포인트형 토큰 (DB 기반 관리)
- **일반 결제**: (향후) 카카오페이 / 토스페이 연동 예정
- **Pi Network**: ⚠️ Mainnet 개방 후 추가 예정 (현재 미구현)

### 인프라 / 배포
- **배포**: Vercel (Frontend + API Routes)
- **DB 호스팅**: Supabase Cloud
- **모니터링**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions → Vercel 자동 배포

---

## 3. 디자인 시스템 (Design System)

### 브랜드 컬러

```css
/* tailwind.config.ts 에 반드시 반영 */
:root {
  /* 메인 퍼플 계열 */
  --color-primary:        #6B21A8;   /* 메인 퍼플 */
  --color-primary-light:  #A855F7;   /* 밝은 퍼플 (hover, accent) */
  --color-primary-dark:   #4C1D95;   /* 짙은 퍼플 (header, nav) */

  /* 포인트 노란색 계열 */
  --color-accent:         #D97706;   /* 짙은 노란색 (PICK 브랜드) */
  --color-accent-light:   #FCD34D;   /* 밝은 노란색 (badge, tag) */
  --color-accent-dark:    #92400E;   /* 강조 텍스트 */

  /* 배경 / 텍스트 */
  --color-bg-main:        #FAF5FF;   /* 메인 배경 (퍼플 틴트) */
  --color-bg-card:        #FFFFFF;
  --color-text-primary:   #1F1235;   /* 짙은 퍼플 계열 텍스트 */
  --color-text-secondary: #6B7280;
  --color-border:         #E9D5FF;   /* 퍼플 계열 보더 */
}
```

### Tailwind 커스텀 컬러 키
```ts
// tailwind.config.ts
colors: {
  'pick-purple':       '#6B21A8',
  'pick-purple-light': '#A855F7',
  'pick-purple-dark':  '#4C1D95',
  'pick-yellow':       '#D97706',
  'pick-yellow-light': '#FCD34D',
  'pick-yellow-dark':  '#92400E',
  'pick-bg':           '#FAF5FF',
  'pick-border':       '#E9D5FF',
}
```

### 폰트
- **한글**: Noto Sans KR (400, 500, 700)
- **영문/숫자**: Inter (400, 600, 700)

### 아이콘
- **라이브러리**: `lucide-react` (기본) + 커스텀 SVG 아이콘

### 하단 탭 네비게이션 (Bottom Navigation — 고정)

| 탭 순서 | 탭명 | 아이콘 | 라우트 |
|---------|------|--------|--------|
| 1 | 홈 | Home | `/home` |
| 2 | 지갑 | Wallet | `/wallet` |
| 3 | PICK주문 | ClipboardList | `/orders` |
| 4 | MyPICK | User | `/my-pick` |

### UI 원칙
- 모바일 퍼스트 (375px 기준, max-width 430px 모바일 뷰)
- **귀엽고 동글동글한 디자인** — 전체 UI의 핵심 컨셉
  - 카드: `rounded-3xl` 이상 (최소 24px 라운드), `shadow-lg` + 연한 색상 배경
  - 버튼: `rounded-full` (pill 형태) 기본, 최소 `rounded-2xl`
  - 아이콘: 채워진(filled) 스타일 또는 굵은 stroke, 크고 귀여운 이모지 활용
  - 입력 필드: `rounded-2xl` 이상
  - 모달 / 바텀시트: `rounded-t-3xl` 이상
  - 전반적으로 sharp한 모서리 금지 — 모든 요소에 넉넉한 border-radius 적용
- 퍼플 ↔ 노란색 그라데이션 버튼 (CTA) — `rounded-full` 필수
- 하단 탭 네비게이션 고정 (Bottom Navigation Bar) — `rounded-t-3xl` 라운드 상단
- 탭 아이콘: 활성 탭은 채워진 아이콘 + 배경 pill 강조 (`rounded-full`, `bg-pick-purple/10`)
- 여백: 넉넉하게 (padding 최소 16px~24px), 요소 간 간격 여유롭게
- 폰트 크기: 카테고리명·라벨 등 핵심 텍스트는 크고 굵게 (font-bold 이상)
- 다크모드: 향후 지원 예정 (현재 라이트 모드 전용)

---

## 4. 프로젝트 구조 (Directory Structure)

```
pick-pick/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # 인증 관련 라우트 그룹
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (user)/                       # 일반 사용자 라우트 그룹
│   │   ├── home/page.tsx             # 홈 탭
│   │   ├── wallet/page.tsx           # 지갑 탭
│   │   ├── orders/                   # PICK주문 탭
│   │   │   ├── page.tsx              # 주문 내역 목록
│   │   │   └── [orderId]/page.tsx    # 주문 상세 / 실시간 추적
│   │   ├── store/
│   │   │   └── [storeId]/page.tsx    # 가맹점 상세 + 메뉴
│   │   └── my-pick/                  # MyPICK 탭
│   │       └── page.tsx
│   ├── (owner)/                      # 사장님 라우트 그룹
│   │   ├── dashboard/page.tsx
│   │   ├── menu/page.tsx
│   │   ├── orders/page.tsx
│   │   └── settlement/page.tsx
│   ├── (rider)/                      # 라이더 라우트 그룹
│   │   ├── dashboard/page.tsx
│   │   ├── delivery/page.tsx
│   │   └── earnings/page.tsx
│   ├── (admin)/                      # 관리자 라우트 그룹
│   │   └── dashboard/page.tsx
│   ├── api/                          # API Route Handlers
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── stores/
│   │   ├── wallet/
│   │   ├── riders/
│   │   └── tokens/                   # PICK 토큰 관련 API
│   ├── layout.tsx                    # 루트 레이아웃
│   └── globals.css
├── components/
│   ├── ui/                           # 공통 UI (Button, Card, Modal, Badge 등)
│   ├── layout/
│   │   ├── BottomNav.tsx             # 하단 탭 네비게이션 (홈/지갑/PICK주문/MyPICK)
│   │   ├── Header.tsx
│   │   └── OwnerLayout.tsx
│   ├── home/                         # 홈 탭 컴포넌트
│   │   ├── CategoryGrid.tsx          # 큼직한 카테고리 카드 그리드 (메인 컨텐츠)
│   │   ├── StoreCard.tsx
│   │   ├── StoreList.tsx
│   │   └── SearchBar.tsx
│   ├── wallet/                       # 지갑 탭 컴포넌트
│   │   ├── BalanceCard.tsx
│   │   ├── TransactionList.tsx
│   │   ├── ChargeModal.tsx
│   │   └── TransferModal.tsx
│   ├── orders/                       # PICK주문 탭 컴포넌트
│   │   ├── OrderStatusCard.tsx
│   │   ├── OrderTracker.tsx          # 실시간 상태 트래커
│   │   ├── OrderHistoryList.tsx
│   │   └── RiderMapView.tsx          # 라이더 실시간 위치 지도
│   ├── my-pick/                      # MyPICK 탭 컴포넌트
│   │   ├── ProfileCard.tsx
│   │   ├── AddressManager.tsx
│   │   ├── FavoriteList.tsx
│   │   ├── GradeBadge.tsx
│   │   └── ReferralCard.tsx
│   ├── owner/                        # 사장님 전용 컴포넌트
│   ├── rider/                        # 라이더 전용 컴포넌트
│   └── shared/                       # 공통 컴포넌트
│       ├── MapView.tsx
│       ├── Toast.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # 클라이언트용 Supabase
│   │   └── server.ts                 # 서버용 Supabase (SSR)
│   ├── pick-token/
│   │   ├── wallet.ts                 # PICK 토큰 지갑 로직
│   │   └── transfer.ts               # 토큰 전송 로직
│   ├── kakao/
│   │   └── maps.ts                   # 카카오맵 SDK 유틸
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useWallet.ts
│   ├── useOrder.ts
│   ├── useRealtime.ts                # Supabase Realtime 훅
│   └── useKakaoMap.ts
├── stores/                           # Zustand 스토어
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── walletStore.ts
├── types/
│   ├── user.ts
│   ├── order.ts
│   ├── store.ts
│   ├── wallet.ts
│   └── rider.ts
├── prisma/
│   └── schema.prisma
├── public/
│   ├── icons/
│   └── images/
├── middleware.ts                     # 인증 미들웨어 (역할 기반 라우팅)
├── tailwind.config.ts
├── next.config.ts
├── .env.local                        # 환경변수 (절대 커밋 금지)
└── CLAUDE.md
```

---

## 5. 데이터베이스 스키마 (Supabase PostgreSQL)

```sql
-- 사용자
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id),
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT UNIQUE,
  role          TEXT DEFAULT 'user'
                CHECK (role IN ('user','owner','rider','admin')),
  address_main  TEXT,
  lat           DECIMAL(10,8),
  lng           DECIMAL(11,8),
  profile_image TEXT,
  -- Pi Network 연동 필드 (Mainnet 개방 후 활성화)
  -- pi_uid        TEXT UNIQUE,
  -- pi_username   TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PICK 토큰 지갑
CREATE TABLE wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  pick_balance    DECIMAL(18,6) DEFAULT 0,    -- PICK 토큰 잔액
  locked_balance  DECIMAL(18,6) DEFAULT 0,    -- 주문 중 잠금 잔액
  total_earned    DECIMAL(18,6) DEFAULT 0,    -- 누적 적립량
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 지갑 트랜잭션 내역
CREATE TABLE wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       UUID REFERENCES wallets(id),
  type            TEXT NOT NULL
                  CHECK (type IN ('charge','payment','refund','reward','transfer','withdraw')),
  amount          DECIMAL(18,6) NOT NULL,
  balance_after   DECIMAL(18,6) NOT NULL,
  ref_order_id    UUID,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 가맹점
CREATE TABLE stores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID REFERENCES users(id),
  name              TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,    -- '한식'|'중식'|'일식'|'치킨'|'피자'|'분식'|'카페' 등
  phone             TEXT,
  address           TEXT NOT NULL,
  lat               DECIMAL(10,8) NOT NULL,
  lng               DECIMAL(11,8) NOT NULL,
  image_url         TEXT,
  banner_url        TEXT,
  min_order_amount  DECIMAL(10,2) DEFAULT 0,
  delivery_fee      DECIMAL(10,2) DEFAULT 0,
  delivery_time     INT DEFAULT 30,   -- 예상 배달 시간(분)
  is_open           BOOLEAN DEFAULT TRUE,
  is_approved       BOOLEAN DEFAULT FALSE,   -- 관리자 승인 여부
  rating            DECIMAL(3,2) DEFAULT 0,
  review_count      INT DEFAULT 0,
  pick_reward_rate  DECIMAL(5,2) DEFAULT 1.0,  -- PICK 적립률(%)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 메뉴
CREATE TABLE menus (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID REFERENCES stores(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  image_url    TEXT,
  category     TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_popular   BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 메뉴 옵션 그룹
CREATE TABLE menu_option_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id     UUID REFERENCES menus(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,       -- '맵기 선택', '사이즈' 등
  is_required BOOLEAN DEFAULT FALSE,
  max_select  INT DEFAULT 1
);

-- 메뉴 옵션
CREATE TABLE menu_options (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id UUID REFERENCES menu_option_groups(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  extra_price     DECIMAL(10,2) DEFAULT 0
);

-- 주문
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id),
  store_id         UUID REFERENCES stores(id),
  rider_id         UUID REFERENCES users(id),
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN (
                     'pending',      -- 결제 대기
                     'confirmed',    -- 사장님 확인
                     'preparing',    -- 조리 중
                     'ready',        -- 조리 완료 (라이더 픽업 대기)
                     'picked_up',    -- 라이더 픽업
                     'delivering',   -- 배달 중
                     'delivered',    -- 배달 완료
                     'cancelled',    -- 취소
                     'refunded'      -- 환불 완료
                   )),
  payment_method   TEXT DEFAULT 'PICK'
                   CHECK (payment_method IN ('PICK','CASH')),  -- 향후 'PI' 추가 예정
  total_amount     DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) DEFAULT 0,
  pick_used        DECIMAL(18,6) DEFAULT 0,    -- 사용한 PICK 토큰
  pick_reward      DECIMAL(18,6) DEFAULT 0,    -- 적립된 PICK 토큰
  delivery_address TEXT NOT NULL,
  delivery_lat     DECIMAL(10,8),
  delivery_lng     DECIMAL(11,8),
  delivery_note    TEXT,
  estimated_time   INT,
  confirmed_at     TIMESTAMPTZ,
  picked_up_at     TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 주문 아이템
CREATE TABLE order_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id  UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_id   UUID REFERENCES menus(id),
  menu_name TEXT NOT NULL,         -- 주문 당시 스냅샷
  price     DECIMAL(10,2) NOT NULL,
  quantity  INT NOT NULL DEFAULT 1,
  options   JSONB DEFAULT '[]'     -- 선택 옵션 스냅샷
);

-- 리뷰
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID UNIQUE REFERENCES orders(id),
  user_id     UUID REFERENCES users(id),
  store_id    UUID REFERENCES stores(id),
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content     TEXT,
  image_urls  TEXT[] DEFAULT '{}',
  pick_reward DECIMAL(18,6) DEFAULT 0,   -- 리뷰 작성 PICK 보상
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 즐겨찾기
CREATE TABLE favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  store_id   UUID REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

-- 라이더 실시간 위치
CREATE TABLE rider_locations (
  rider_id   UUID PRIMARY KEY REFERENCES users(id),
  lat        DECIMAL(10,8) NOT NULL,
  lng        DECIMAL(11,8) NOT NULL,
  is_active  BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 라이더 수익 내역
CREATE TABLE rider_earnings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id    UUID REFERENCES users(id),
  order_id    UUID REFERENCES orders(id),
  amount_pick DECIMAL(18,6) DEFAULT 0,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','settled')),
  settled_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 알림
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,   -- 'order_update'|'reward'|'promotion' 등
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. 핵심 기능 명세 (Feature Specification)

### 6-1. 홈 탭 (Home — `/home`)

**사용자 기준**
- **카테고리 그리드 (메인 컨텐츠)**: 화면 대부분을 차지하는 큼직한 카테고리 카드 그리드
  - 2열 그리드, 카드 크기 크게 (최소 160px 높이)
  - 각 카드: 이모지 + 카테고리명, `rounded-3xl`, 밝은 파스텔 배경색
  - 카테고리 목록: 한식 🍚, 중식 🥟, 일식 🍱, 치킨 🍗, 피자 🍕, 분식 🍜, 카페·디저트 ☕, 양식 🥩
  - 카드 탭 시 해당 카테고리 가맹점 목록으로 이동
- 검색 바 (상단 고정, `rounded-full`, 아이콘 포함)
- PICK 토큰 잔액 미니 위젯 (헤더 우측)
- ~~배너 슬라이더~~ 미구현 (MVP 제외)
- ~~인기 맛집 섹션~~ 미구현 (MVP 제외)
- ~~빠른 배달 섹션~~ 미구현 (MVP 제외)

**사장님 기준**
- 오늘의 주문 현황 요약 (신규/진행중/완료)
- 오늘 매출 요약 (PICK 토큰)
- 긴급 알림 (새 주문, 리뷰)

**라이더 기준**
- 주변 배달 가능 주문 목록
- 현재 진행 중인 배달 현황
- 오늘 수익 요약

---

### 6-2. 지갑 탭 (Wallet — `/wallet`)

- **PICK 토큰 잔액** 메인 표시 (크고 선명하게)
- **잠금 잔액** 표시 (주문 진행 중 홀드 금액)
- **충전**: 관리자 지급 / 이벤트 보상 등 (향후 카카오페이·토스페이 연동 예정)
- **보내기**: 다른 PICK PICK 사용자에게 PICK 토큰 전송
- **거래 내역**: 충전/사용/적립/전송 전체 히스토리 (무한 스크롤)
- **PICK 등급 및 누적 적립 배너**
- ⚠️ Pi 코인 연동 및 PICK↔Pi 전환: Mainnet 개방 후 추가 예정

---

### 6-3. PICK주문 탭 (주문내역 — `/orders`)

- **진행 중인 주문** 실시간 상태 트래킹 (Supabase Realtime)
- 주문 상태 단계별 표시:

  | 상태 | 사용자 화면 |
  |------|------------|
  | `pending` | 결제 확인 중 |
  | `confirmed` | 사장님이 주문 수락 |
  | `preparing` | 조리 중 🍳 (타이머) |
  | `ready` | 조리 완료, 라이더 픽업 대기 |
  | `picked_up` | 라이더 픽업 완료 |
  | `delivering` | 배달 중 🛵 (라이더 실시간 위치 지도) |
  | `delivered` | 배달 완료 → 리뷰 작성 유도 |
  | `cancelled` | 취소됨 |

- **주문 히스토리**: 완료·취소 주문 목록 (날짜별 그룹)
- **재주문**: 이전 주문 그대로 빠른 재주문
- **주문 취소 / 환불 신청**
- **영수증 상세**: 메뉴·옵션·금액·PICK 사용/적립 내역

---

### 6-4. MyPICK 탭 (내 정보 및 기타 — `/my-pick`)

- 프로필 정보 (이름, 전화번호, 이메일, 프로필 이미지)
- 배달 주소 관리 (기본 주소 + 추가 주소 최대 5개)
- **즐겨찾기 가맹점** 목록
- **리뷰 내역**
- **PICK 등급 시스템** (누적 사용량 기반):

  | 등급 | 조건 | 혜택 |
  |------|------|------|
  | 🌱 SEED | 기본 | 기본 적립 1% |
  | 🌿 SPROUT | 누적 1,000 PICK | 적립 1.5% |
  | 🌳 TREE | 누적 5,000 PICK | 적립 2% |
  | 🌲 FOREST | 누적 20,000 PICK | 적립 3% + 특별 혜택 |

- **친구 초대** (레퍼럴 코드 공유 → PICK 토큰 보상)
- **알림 설정** (주문 알림, 프로모션 알림 등)
- **공지사항 / FAQ**
- **로그아웃**
- ⚠️ Pi Network 계정 연동: Mainnet 개방 후 추가 예정

---

### 6-5. 사장님 대시보드 (Owner — `/owner`)

- 가게 기본 정보 관리 (영업시간, 휴무일, 최소주문금액)
- **메뉴 관리**: CRUD, 이미지 업로드, 품절 처리, 순서 변경
- **실시간 주문 관리**:
  - 신규 주문 수락 / 거절
  - 조리 완료 처리 (라이더 호출)
  - 예상 시간 조정
- **매출 통계**: 일별·주별·월별 차트 (PICK 토큰 기준)
- **PICK 토큰 정산**: 축적된 PICK 정산 신청
- **리뷰 관리**: 확인 및 사장님 답글

---

### 6-6. 라이더 대시보드 (Rider — `/rider`)

- **온/오프라인 상태 전환**
- **배달 요청 수락**: 주변 픽업 가능 주문 알림
- **카카오맵 내비게이션** 연동 (픽업지·배달지 안내)
- **실시간 위치 공유**: 배달 중 사용자에게 위치 노출
- **수익 관리**: 일별·주별 PICK 토큰 수익 내역
- **정산 신청**

---

## 7. 환경 변수 (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 서버 전용 (절대 클라이언트 노출 금지)

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_KEY=        # 카카오 개발자 콘솔에서 발급

# Firebase (FCM 푸시 알림)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_SDK_JSON=          # 서버 전용

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PICK PICK
NEXT_PUBLIC_APP_VERSION=0.1.0

# PICK 토큰 설정
PICK_REWARD_RATE_DEFAULT=0.01     # 기본 적립률 1%
PICK_REVIEW_REWARD=10             # 리뷰 작성 보상 (PICK)
PICK_REFERRAL_REWARD=50           # 친구 초대 보상 (PICK)

# Pi Network (추후 Mainnet 개방 후 추가)
# NEXT_PUBLIC_PI_APP_ID=
# PI_API_KEY=
# NEXT_PUBLIC_PI_SANDBOX=true
```

---

## 8. API 라우트 구조

```
# 인증
POST   /api/auth/register           # 회원가입
POST   /api/auth/login              # 로그인
GET    /api/auth/me                 # 현재 사용자 정보

# 가맹점
GET    /api/stores                  # 목록 (위치·카테고리 필터)
GET    /api/stores/[id]             # 상세
POST   /api/stores                  # 등록 (owner)
PATCH  /api/stores/[id]             # 수정 (owner)

# 메뉴
GET    /api/stores/[id]/menus       # 메뉴 목록
POST   /api/stores/[id]/menus       # 등록 (owner)
PATCH  /api/menus/[id]              # 수정 (owner)
DELETE /api/menus/[id]              # 삭제 (owner)

# 주문
POST   /api/orders                  # 주문 생성
GET    /api/orders/[id]             # 주문 상세
PATCH  /api/orders/[id]/status      # 상태 변경
GET    /api/orders/my               # 내 주문 목록

# 지갑 / PICK 토큰
GET    /api/wallet/balance          # 잔액 조회
GET    /api/wallet/transactions     # 거래 내역
POST   /api/wallet/charge           # PICK 충전 (관리자·이벤트)
POST   /api/wallet/transfer         # PICK 전송

# 라이더
GET    /api/rider/available-orders  # 수락 가능 주문 목록
POST   /api/rider/accept/[orderId]  # 배달 수락
PATCH  /api/rider/location          # 위치 업데이트

# 리뷰
POST   /api/reviews                 # 리뷰 작성
GET    /api/reviews/store/[id]      # 가맹점 리뷰 목록

# 알림
GET    /api/notifications           # 알림 목록
PATCH  /api/notifications/read      # 읽음 처리
```

---

## 9. 역할 기반 접근 제어 (RBAC)

```typescript
// middleware.ts 에서 처리

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/owner':    ['owner', 'admin'],
  '/rider':    ['rider', 'admin'],
  '/admin':    ['admin'],
  '/home':     ['user', 'owner', 'rider', 'admin'],
  '/wallet':   ['user', 'owner', 'rider', 'admin'],
  '/orders':   ['user', 'owner', 'rider', 'admin'],
  '/my-pick':  ['user', 'owner', 'rider', 'admin'],
};

// Supabase RLS 정책 (모든 테이블에 적용 필수)
// - stores:              owner만 자신의 가게 수정 가능
// - orders:              user는 본인 주문만, owner는 자기 가게 주문만, rider는 수락한 주문만
// - wallets:             본인만 조회 가능
// - wallet_transactions: 본인 지갑만 조회 가능
// - rider_locations:     해당 주문 user와 rider만 조회 가능
```

---

## 10. 실시간 기능 (Supabase Realtime)

```typescript
// 구독 채널 목록

// 1. 주문 상태 변경  → 사용자·사장님·라이더 모두
//    채널: `order:${orderId}`

// 2. 새 주문 알림    → 사장님
//    채널: `store:${storeId}:orders`

// 3. 라이더 위치     → 배달 중인 사용자
//    채널: `rider:${riderId}:location`

// 4. 배달 요청 알림  → 주변 라이더 (status = 'ready')
//    채널: `rider:${riderId}:requests`

// 5. 개인 알림       → 해당 사용자
//    채널: `user:${userId}:notifications`
```

---

## 11. 개발 규칙 및 컨벤션

### 코딩 스타일
- **언어**: TypeScript strict mode 필수 (`any` 타입 사용 금지)
- **컴포넌트**: 함수형 컴포넌트 + 화살표 함수
- **파일명**: 컴포넌트는 PascalCase, 유틸·훅은 camelCase
- **임포트 순서**: React → 외부 라이브러리 → 내부 모듈 → 타입
- **주석**: 복잡한 비즈니스 로직에만 한국어 또는 영어 주석
- **에러 처리**: try/catch 필수, 에러 메시지는 한국어 사용자 친화적으로

### Git 커밋 컨벤션
```
feat:     새로운 기능
fix:      버그 수정
style:    UI/스타일 변경 (로직 무변경)
refactor: 리팩토링
chore:    설정·패키지 등
docs:     문서 수정
```

### 컴포넌트 작성 원칙
- 단일 책임 원칙 — 컴포넌트 하나당 하나의 역할
- 200줄 이상 컴포넌트는 분리 검토
- props 타입은 반드시 `interface`로 정의
- 서버 컴포넌트 vs 클라이언트 컴포넌트 명확히 구분 (`'use client'` 최소화)

### 보안 원칙
- `SUPABASE_SERVICE_ROLE_KEY` 등 시크릿은 서버 사이드에서만 사용
- 사용자 입력은 Zod로 반드시 검증 후 DB 저장
- Supabase RLS 정책 모든 테이블에 적용 필수
- PICK 토큰 잔액 변경은 반드시 서버 사이드 API에서만 처리 (클라이언트 직접 변경 금지)

---

## 12. 개발 로드맵 (Milestone)

### Phase 1 — MVP (1~2개월)
- [ ] 이메일/소셜 로그인 (Supabase Auth)
- [ ] 사용자 회원가입·로그인·역할 설정
- [ ] 가맹점 목록·상세·메뉴 (카카오맵)
- [ ] 장바구니 및 주문 생성
- [ ] PICK 토큰 지갑 (잔액·내역)
- [ ] 주문 실시간 상태 트래킹
- [ ] 사장님 주문 수락·처리
- [ ] 라이더 배달 수락·완료
- [ ] 하단 탭 네비게이션 (홈 / 지갑 / PICK주문 / MyPICK)

### Phase 2 — 안정화 (3개월)
- [ ] 리뷰·평점 시스템 + PICK 보상
- [ ] PICK 등급 시스템 (SEED → FOREST)
- [ ] 라이더 실시간 위치 공유 (지도)
- [ ] 매출·수익 통계 대시보드
- [ ] FCM 푸시 알림
- [ ] 친구 초대 레퍼럴

### Phase 3 — 성장 (4~6개월)
- [ ] 카카오페이 / 토스페이 결제 연동
- [ ] 쿠폰·프로모션 시스템
- [ ] 다중 배달 주소 관리
- [ ] 가맹점 광고·노출 시스템
- [ ] 관리자 대시보드
- [ ] 다크모드 지원
- [ ] PWA 오프라인 지원

### Phase 4 — Pi Network 연동 (Mainnet 개방 후)
- [ ] Pi Network SDK 인증 연동
- [ ] Pi 코인 결제 연동
- [ ] PICK ↔ Pi 토큰 전환
- [ ] Pi 기반 정산 시스템
- [ ] users 테이블 `pi_uid`, `pi_username` 필드 활성화

---

## 13. 참고 자료

- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router Docs](https://nextjs.org/docs)
- [Kakao Maps SDK](https://apis.map.kakao.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs)
- Pi Network SDK (추후): [developers.minepi.com](https://developers.minepi.com)

---

> **중요**: 이 CLAUDE.md는 프로젝트가 진행되면서 지속적으로 업데이트해야 합니다.
> 새로운 기능, 테이블, API가 추가될 때마다 이 문서를 먼저 갱신하세요.
> Claude는 코드 작성 전 반드시 이 문서를 참조하고, 여기 정의된 구조와 컨벤션을 따르세요.
>
> ⚠️ Pi Network 관련 기능은 Mainnet 개방 확인 후 Phase 4에서 별도 구현합니다.
> 현재는 Pi 관련 코드를 절대 작성하지 마세요.