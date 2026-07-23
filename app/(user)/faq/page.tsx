"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronDown, ChevronUp,
  HelpCircle, Megaphone, Package, Coins, Bike,
  Shield, MessageCircle, Star,
} from "lucide-react";

// ── 공지사항 ─────────────────────────────────────────────
const NOTICES = [
  {
    id:   "n3",
    date: "테스트넷",
    tag:  "안내",
    title: "테스트넷 적립 PICK 안내 💜",
    body:  "현재 PICK PICK은 Pi 테스트넷 단계입니다. 적립한 PICK은 메인넷 토큰 발행 정책에 따라 비율로 전환되며, 어뷰징(다계정·자기초대·자기배달) 계정은 전환에서 제외됩니다.",
  },
  {
    id:   "n2",
    date: "테스트넷",
    tag:  "이벤트",
    title: "친구 초대 보상 🎉",
    body:  "친구가 내 초대 코드를 입력하면 나에게 5,000 PICK, 친구에게도 가입 보상(일반 이용자 5,000 · 라이더 10,000 · 사장님 20,000 PICK)이 지급됩니다. (최대 5명 · 서로 초대는 불가)",
  },
  {
    id:   "n1",
    date: "테스트넷",
    tag:  "안내",
    title: "출석 체크로 매일 PICK 받기 🗓️",
    body:  "매일 출석 체크로 50 PICK, 7일 연속 시 +100 PICK을 드려요. 최근 주문이 있으면 출석 활동 보너스가 추가됩니다. 지갑 탭에서 확인해보세요!",
  },
];

// ── FAQ 데이터 ────────────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    key:   "order",
    label: "주문",
    Icon:  Package,
    items: [
      {
        q: "주문은 어떻게 하나요?",
        a: "홈 탭에서 카테고리나 가게를 선택하고, 메뉴를 장바구니에 담은 뒤 결제하면 됩니다. 현재 테스트넷에서는 현금+π(Pi 테스트 토큰) 혼합 결제를 사용합니다.",
      },
      {
        q: "주문을 취소할 수 있나요?",
        a: "사장님이 주문을 수락하기 전(대기 중 / 확인 상태)에는 취소 가능합니다. 주문 상세 페이지에서 '주문 취소' 버튼을 눌러주세요. 결제하신 금액은 환불됩니다.",
      },
      {
        q: "재주문 기능이 있나요?",
        a: "PICK주문 탭의 주문 내역에서 '재주문' 버튼을 누르면 이전 주문과 동일한 메뉴가 장바구니에 자동으로 담깁니다.",
      },
      {
        q: "포장 주문은 어떻게 하나요?",
        a: "장바구니에서 '포장'을 선택하면 배달비 없이 주문할 수 있습니다. 조리 완료 후 가게에서 직접 수령해 주세요.",
      },
    ],
  },
  {
    key:   "pick",
    label: "PICK 토큰",
    Icon:  Coins,
    items: [
      {
        q: "PICK 토큰이 무엇인가요?",
        a: "PICK 토큰은 PICK PICK 앱 내에서 쌓는 포인트입니다. 출석·초대·리뷰 등으로 적립할 수 있어요. 현재 Pi 테스트넷 단계로, 적립한 PICK은 메인넷 토큰 정책에 따라 비율로 전환될 예정입니다.",
      },
      {
        q: "PICK 토큰은 어떻게 적립되나요?",
        a: "① 출석 체크(하루 50 PICK, 7일 연속 시 +100), ② 친구 초대(초대자 5,000 · 피초대자 역할별 5,000~20,000), ③ 사진 리뷰 작성(가게가 설정한 보상), ④ PICK 지급 쿠폰 사용 시 적립됩니다.",
      },
      {
        q: "PICK 등급은 무엇인가요?",
        a: "PICK 등급은 누적 적립에 따라 올라가는 레벨 표시입니다. 등급별 혜택은 메인넷 정식 출시 때 적용될 예정입니다.",
      },
      {
        q: "PICK 토큰의 유효기간이 있나요?",
        a: "현재 PICK 토큰에는 별도의 유효기간이 없습니다.",
      },
    ],
  },
  {
    key:   "delivery",
    label: "배달",
    Icon:  Bike,
    items: [
      {
        q: "배달 시간은 얼마나 걸리나요?",
        a: "예상 시간은 가게 조리 시간에 배달 거리를 더해 자동 계산됩니다. 주소를 입력하면 장바구니에서 '예상 도착 시간'을 확인할 수 있어요.",
      },
      {
        q: "실시간 배달 위치를 확인할 수 있나요?",
        a: "주문 상세 페이지에서 라이더의 실시간 위치를 지도로 확인할 수 있습니다. 라이더가 픽업한 이후부터 위치가 표시됩니다.",
      },
      {
        q: "배달비는 어떻게 결정되나요?",
        a: "가게별 기본 배달비에 배달 거리 할증이 더해져 결정됩니다. 정확한 배달비는 주소 입력 후 장바구니에서 확인할 수 있고, '배달비 무료' 쿠폰이 있으면 면제됩니다.",
      },
    ],
  },
  {
    key:   "account",
    label: "계정·보안",
    Icon:  Shield,
    items: [
      {
        q: "로그인은 어떻게 하나요?",
        a: "PICK PICK은 Pi 생태계 전용 서비스로, Pi Browser에서 'Pi Browser로 로그인'을 이용합니다. 별도 비밀번호가 없으니 Pi 계정으로 다시 로그인해 주세요.",
      },
      {
        q: "개인정보는 어떻게 보호되나요?",
        a: "PICK PICK은 개인정보를 암호화하여 안전하게 보관하며, 제3자에게 제공하지 않습니다. 자세한 내용은 개인정보 처리방침을 확인해 주세요.",
      },
      {
        q: "탈퇴하고 싶어요.",
        a: "현재 앱 내 탈퇴 기능은 준비 중입니다. 탈퇴를 원하시면 고객센터 이메일(support@pickpick.kr)로 문의해 주세요.",
      },
    ],
  },
  {
    key:   "review",
    label: "리뷰",
    Icon:  Star,
    items: [
      {
        q: "리뷰는 언제 작성할 수 있나요?",
        a: "배달이 완료된 주문에 한해 리뷰를 작성할 수 있습니다. 주문 상세 페이지에서 '리뷰 작성' 버튼을 눌러주세요.",
      },
      {
        q: "리뷰를 작성하면 보상이 있나요?",
        a: "사진을 첨부해 리뷰를 작성하면 가게가 설정한 PICK 보상이 지급됩니다. (사진이 없는 일반 리뷰는 보상이 없을 수 있어요.)",
      },
      {
        q: "작성한 리뷰를 수정하거나 삭제할 수 있나요?",
        a: "현재 등록된 리뷰의 수정 및 삭제 기능은 준비 중입니다. 불적절한 리뷰의 경우 고객센터로 문의해 주세요.",
      },
    ],
  },
];

// ── 공지 태그 색상 ────────────────────────────────────────
function tagStyle(tag: string) {
  switch (tag) {
    case "이벤트":  return "bg-pink-100 text-pink-700";
    case "업데이트": return "bg-sky-100 text-sky-700";
    default:         return "bg-amber-100 text-amber-700";
  }
}

// ── FAQ 아코디언 아이템 ────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left"
    >
      <div className={`flex items-start justify-between gap-3 px-4 py-4 transition-colors ${open ? "bg-pick-bg/60" : ""}`}>
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pick-purple text-white text-[10px] font-black flex items-center justify-center mt-0.5">Q</span>
          <p className={`text-sm font-bold leading-snug ${open ? "text-pick-purple" : "text-pick-text"}`}>{q}</p>
        </div>
        {open
          ? <ChevronUp   size={16} className="text-pick-purple flex-shrink-0 mt-0.5" />
          : <ChevronDown size={16} className="text-pick-text-sub flex-shrink-0 mt-0.5" />
        }
      </div>
      {open && (
        <div className="px-4 pb-4 bg-pick-bg/60">
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pick-purple-light/30 text-pick-purple text-[10px] font-black flex items-center justify-center mt-0.5">A</span>
            <p className="text-sm text-pick-text-sub leading-relaxed">{a}</p>
          </div>
        </div>
      )}
    </button>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────
export default function FaqPage() {
  const [tab,         setTab]         = useState<"notice" | "faq">("notice");
  const [activeNotice, setActiveNotice] = useState<string | null>(null);
  const [faqCat,      setFaqCat]      = useState("order");

  return (
    <div className="min-h-full pb-8">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-white dark:bg-pick-card border-b border-pick-border">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Link href="/my-pick"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-pick-bg border border-pick-border flex-shrink-0">
            <ChevronLeft size={18} className="text-pick-text-sub" />
          </Link>
          <h1 className="font-black text-pick-text text-base flex items-center gap-2">
            <HelpCircle size={20} className="text-pick-purple" />
            공지사항 · FAQ
          </h1>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-pick-border">
          {([
            { key: "notice", label: "공지사항", Icon: Megaphone },
            { key: "faq",    label: "자주 묻는 질문", Icon: MessageCircle },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-bold border-b-2 transition-colors ${
                tab === key
                  ? "border-pick-purple text-pick-purple"
                  : "border-transparent text-pick-text-sub"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 공지사항 탭 ── */}
      {tab === "notice" && (
        <div className="px-4 py-4 flex flex-col gap-3">
          {NOTICES.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveNotice(activeNotice === n.id ? null : n.id)}
              className="w-full text-left bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden"
            >
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${tagStyle(n.tag)}`}>
                    {n.tag}
                  </span>
                  <span className="text-[11px] text-pick-text-sub ml-auto">{n.date}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-pick-text text-sm leading-snug">{n.title}</p>
                  {activeNotice === n.id
                    ? <ChevronUp   size={16} className="text-pick-text-sub flex-shrink-0 mt-0.5" />
                    : <ChevronDown size={16} className="text-pick-text-sub flex-shrink-0 mt-0.5" />
                  }
                </div>
              </div>
              {activeNotice === n.id && (
                <div className="px-4 pb-4 border-t border-pick-border bg-pick-bg/50">
                  <p className="text-sm text-pick-text-sub leading-relaxed pt-3">{n.body}</p>
                </div>
              )}
            </button>
          ))}

          {/* 고객센터 */}
          <div className="bg-gradient-to-br from-pick-purple/10 to-pick-purple-light/10 rounded-3xl border-2 border-pick-border p-5 mt-2">
            <p className="font-black text-pick-text text-sm mb-1">📬 고객센터</p>
            <p className="text-xs text-pick-text-sub leading-relaxed mb-3">
              공지사항 외 문의사항은 이메일로 연락해 주세요. 빠르게 답변드릴게요!
            </p>
            <a
              href="mailto:support@pickpick.kr"
              className="inline-flex items-center gap-2 bg-pick-purple text-white text-xs font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform"
            >
              <MessageCircle size={13} />
              support@pickpick.kr
            </a>
          </div>
        </div>
      )}

      {/* ── FAQ 탭 ── */}
      {tab === "faq" && (
        <div>
          {/* 카테고리 필터 */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
            {FAQ_CATEGORIES.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setFaqCat(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  faqCat === key
                    ? "bg-pick-purple text-white shadow-sm"
                    : "bg-white dark:bg-pick-card text-pick-text-sub border-2 border-pick-border"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* FAQ 목록 */}
          <div className="mx-4 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden divide-y divide-pick-border">
            {FAQ_CATEGORIES.find((c) => c.key === faqCat)?.items.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>

          {/* 더 궁금하신 점 */}
          <div className="mx-4 mt-4 bg-pick-bg rounded-3xl border-2 border-pick-border p-5">
            <p className="font-bold text-pick-text text-sm mb-1">원하는 답변을 찾지 못했나요?</p>
            <p className="text-xs text-pick-text-sub mb-3">고객센터 이메일로 문의해 주시면 1~2 영업일 내에 답변드립니다.</p>
            <a
              href="mailto:support@pickpick.kr"
              className="inline-flex items-center gap-2 bg-white border-2 border-pick-border text-pick-text text-xs font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform"
            >
              <MessageCircle size={13} className="text-pick-purple" />
              문의하기
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
