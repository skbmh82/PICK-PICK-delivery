export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-pick-text">
      <h1 className="text-2xl font-black text-pick-purple mb-2">개인정보처리방침</h1>
      <p className="text-sm text-pick-text-sub mb-8">Privacy Policy — PICK PICK (픽픽)</p>

      {[
        {
          title: "1. 수집하는 개인정보",
          content: "픽픽은 서비스 제공을 위해 이메일, 이름, 전화번호, 배달 주소, Pi Network UID를 수집합니다.",
        },
        {
          title: "2. 개인정보 이용 목적",
          content: "수집된 정보는 주문 처리, 배달 서비스, PICK 토큰 적립, Pi 코인 결제 처리에만 사용됩니다.",
        },
        {
          title: "3. 개인정보 보관 기간",
          content: "회원 탈퇴 시 즉시 삭제되며, 관련 법령에 따라 일부 정보는 최대 5년간 보관될 수 있습니다.",
        },
        {
          title: "4. 제3자 제공",
          content: "배달 서비스를 위해 라이더에게 배달 주소가 공유됩니다. Pi Network 결제 처리를 위해 Pi Network Inc.와 결제 정보가 공유됩니다. 그 외 제3자에게는 개인정보를 제공하지 않습니다.",
        },
        {
          title: "5. 이용자 권리",
          content: "이용자는 언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다. 문의: kctc8182@gmail.com",
        },
        {
          title: "6. Pi Network 데이터",
          content: "Pi Browser를 통한 로그인 및 결제 시 Pi Network SDK를 통해 Pi UID와 사용자명이 수집됩니다. 이는 Pi Network의 개인정보처리방침에도 적용됩니다.",
        },
        {
          title: "7. 쿠키 및 로컬 스토리지",
          content: "서비스 이용 편의를 위해 로그인 세션 유지 목적으로 로컬 스토리지를 사용합니다.",
        },
        {
          title: "8. 문의처",
          content: "개인정보 관련 문의는 kctc8182@gmail.com으로 연락해 주세요.",
        },
      ].map((item) => (
        <div key={item.title} className="mb-6">
          <h2 className="font-black text-base text-pick-text mb-2">{item.title}</h2>
          <p className="text-sm text-pick-text-sub leading-relaxed">{item.content}</p>
        </div>
      ))}

      <p className="text-xs text-pick-text-sub mt-12 pt-6 border-t border-pick-border">
        최종 수정일: 2026년 4월 21일
      </p>
    </div>
  );
}
