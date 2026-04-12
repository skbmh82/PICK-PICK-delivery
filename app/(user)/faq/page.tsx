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
    date: "2025.04.10",
    tag:  "업데이트",
    title: "포장 주문 기능 오픈 🎁",
    body:  "이제 가게에서 직접 포장 주문을 할 수 있어요! 포장 주문 시 배달비가 면제되며, 조리 완료 후 가게에서 직접 수령하시면 됩니다.",
  },
  {
    id:   "n2",
    date: "2025.03.25",
    tag:  "이벤트",
    title: "PICK 친구 초대 이벤트 — 둘 다 50 PICK 🎉",
    body:  "친구를 초대하면 초대한 분과 초대받은 분 모두 50 PICK 을 드립니다. MyPICK 탭에서 내 초대 코드를 공유해보세요!",
  },
  {
    id:   "n1",
    date: "2025.03.01",
    tag:  "공지",
    title: "PICK PICK 서비스 오픈 안내 🚀",
    body:  "PICK PICK 배달 서비스가 정식 오픈했습니다. 첫 주문 시 30 PICK 을 즉시 지급해드립니다. 많은 이용 부탁드립니다!",
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
        a: "홈 탭에서 원하는 카테고리나 가게를 선택하고, 메뉴를 골라 장바구니에 담은 뒤 결제하면 됩니다. 결제 수단으로 PICK 토큰을 사용할 수 있습니다.",
      },
      {
        q: "주문을 취소할 수 있나요?",
        a: "사장님이 주문을 수락하기 전(대기 중 / 확인 상태)에는 취소 가능합니다. 주문 상세 페이지에서 '주문 취소' 버튼을 눌러주세요. 사용한 PICK 토큰은 즉시 환불됩니다.",
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
        a: "PICK 토큰은 PICK PICK 앱 내에서 사용하는 자체 포인트입니다. 주문 결제에 사용하거나 다른 사용자에게 전송할 수 있습니다.",
      },
      {
        q: "PICK 토큰은 어떻게 적립되나요?",
        a: "주문 완료 시 결제 금액의 일정 비율이 PICK 토큰으로 적립됩니다. 리뷰 작성 시 10 PICK, 친구 초대 시 50 PICK이 추가 지급됩니다.",
      },
      {
        q: "PICK 등급은 어떻게 올리나요?",
        a: "누적 적립 PICK에 따라 등급이 올라갑니다. SEED(기본) → SPROUT(1,000 PICK) → TREE(5,000 PICK) → FOREST(20,000 PICK) 순으로 높은 등급일수록 적립률이 올라갑니다.",
      },
      {
        q: "PICK 토큰의 유효기간이 있나요?",
        a: "현재 PICK 토큰에는 별도의 유효기간이 없습니다. 적립된 PICK 토큰은 언제든 사용할 수 있습니다.",
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
        a: "가게마다 예상 배달 시간이 다릅니다. 주문 후 라이더 배정 → 조리 → 배달까지 평균 30~50분 정도 소요됩니다.",
      },
      {
        q: "실시간 배달 위치를 확인할 수 있나요?",
        a: "주문 상세 페이지에서 라이더의 실시간 위치를 지도로 확인할 수 있습니다. 라이더가 픽업한 이후부터 위치가 표시됩니다.",
      },
      {
        q: "배달비는 어떻게 결정되나요?",
        a: "배달비는 가게별로 다르게 설정돼 있습니다. 가게 목록 및 상세 페이지에서 확인할 수 있으며, 쿠폰 또는 PICK 등급에 따라 배달비 무료 혜택을 받을 수 있습니다.",
      },
    ],
  },
  {
    key:   "account",
    label: "계정·보안",
    Icon:  Shield,
    items: [
      {
        q: "비밀번호를 잊어버렸어요.",
        a: "로그인 페이지의 '비밀번호 찾기' 버튼을 눌러 이메일로 재설정 링크를 받을 수 있습니다.",
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
        a: "리뷰를 작성하면 10 PICK 토큰이 즉시 지급됩니다.",
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
