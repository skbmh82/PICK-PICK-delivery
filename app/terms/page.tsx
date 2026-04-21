export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-pick-text">
      <h1 className="text-2xl font-black text-pick-purple mb-2">이용약관</h1>
      <p className="text-sm text-pick-text-sub mb-8">Terms of Service — PICK PICK (픽픽)</p>

      {[
        {
          title: "제1조 (목적)",
          content: "본 약관은 픽픽(PICK PICK)이 제공하는 배달 플랫폼 서비스의 이용 조건 및 절차, 이용자와 회사 간의 권리·의무를 규정함을 목적으로 합니다.",
        },
        {
          title: "제2조 (서비스 내용)",
          content: "픽픽은 음식 주문·배달 중개 서비스, PICK 토큰 적립 및 결제, Pi Network 코인 결제 연동 서비스를 제공합니다.",
        },
        {
          title: "제3조 (회원가입)",
          content: "이용자는 픽픽이 정한 양식에 따라 회원정보를 기입하고 본 약관에 동의함으로써 회원가입을 완료합니다. 만 14세 미만은 가입이 제한될 수 있습니다.",
        },
        {
          title: "제4조 (PICK 토큰)",
          content: "PICK 토큰은 픽픽 플랫폼 내에서만 사용 가능한 포인트형 디지털 자산입니다. 현금으로 환전되지 않으며, 서비스 내 결제 및 적립 목적으로만 사용됩니다.",
        },
        {
          title: "제5조 (Pi Network 결제)",
          content: "Pi Network 코인 결제는 Pi Network Testnet 환경에서 테스트 중이며, Mainnet 전환 후 실제 결제가 가능합니다. Pi 결제 관련 분쟁은 Pi Network 이용약관에도 적용됩니다.",
        },
        {
          title: "제6조 (이용자 의무)",
          content: "이용자는 타인의 정보를 도용하거나, 서비스를 악용하거나, 비정상적인 방법으로 PICK 토큰을 획득하는 행위를 해서는 안 됩니다.",
        },
        {
          title: "제7조 (서비스 중단)",
          content: "픽픽은 시스템 점검, 장애, 불가항력적 사유로 서비스를 일시 중단할 수 있으며, 이로 인한 손해에 대해 책임을 지지 않습니다.",
        },
        {
          title: "제8조 (면책조항)",
          content: "픽픽은 배달 음식의 품질, 가맹점 정보의 정확성에 대해 보증하지 않습니다. 가맹점과 이용자 간의 분쟁에 대해 픽픽은 중재 역할만 수행합니다.",
        },
        {
          title: "제9조 (준거법)",
          content: "본 약관은 대한민국 법률에 따라 해석되며, 분쟁 발생 시 대한민국 법원을 관할 법원으로 합니다.",
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
