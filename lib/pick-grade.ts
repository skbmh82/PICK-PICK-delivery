/**
 * PICK 등급 시스템
 * 누적 적립량(total_earned) 기준으로 등급 및 적립 배율을 결정합니다.
 */

export type PickGrade = "SEED" | "SPROUT" | "TREE" | "FOREST";

export interface GradeInfo {
  grade:      PickGrade;
  label:      string;
  emoji:      string;
  multiplier: number;   // 기본 적립률에 곱하는 배수
  minEarned:  number;   // 해당 등급 달성에 필요한 최소 누적 적립량
  nextMin:    number | null;  // 다음 등급까지 필요한 누적량 (최고 등급이면 null)
}

export const GRADE_TABLE: GradeInfo[] = [
  { grade: "SEED",   label: "씨앗",   emoji: "🌱", multiplier: 1.0, minEarned: 0,      nextMin: 1000  },
  { grade: "SPROUT", label: "새싹",   emoji: "🌿", multiplier: 1.5, minEarned: 1000,   nextMin: 5000  },
  { grade: "TREE",   label: "나무",   emoji: "🌳", multiplier: 2.0, minEarned: 5000,   nextMin: 20000 },
  { grade: "FOREST", label: "숲",     emoji: "🌲", multiplier: 3.0, minEarned: 20000,  nextMin: null  },
];

/** total_earned 기준으로 현재 등급 정보를 반환합니다. */
export function getGradeInfo(totalEarned: number): GradeInfo {
  for (let i = GRADE_TABLE.length - 1; i >= 0; i--) {
    if (totalEarned >= GRADE_TABLE[i].minEarned) {
      return GRADE_TABLE[i];
    }
  }
  return GRADE_TABLE[0];
}

/**
 * 주문 금액과 기본 적립률, 사용자 등급 배율을 적용한 PICK 적립량을 계산합니다.
 * @param orderAmount  주문 금액 + 배달비 합산
 * @param baseRate     기본 적립률 (%)  예: 1.0 = 1%
 * @param totalEarned  사용자 누적 적립량 (등급 결정용)
 */
export function calcPickReward(
  orderAmount:  number,
  baseRate:     number,
  totalEarned:  number
): number {
  const { multiplier } = getGradeInfo(totalEarned);
  const effectiveRate  = (baseRate / 100) * multiplier;
  // 소수점 1자리 반올림
  return Math.round(orderAmount * effectiveRate * 10) / 10;
}
