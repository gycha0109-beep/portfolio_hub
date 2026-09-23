# Porthub

외주·프로젝트 클라이언트에게 공개하는 통합 포트폴리오 허브입니다.

## 목적

- 프로젝트 원본 GitHub 저장소와 공개 포트폴리오를 분리
- 구현 소스 대신 문제 정의, 해결 방식, 작동 데모, 검증 결과를 공개
- 여러 프로젝트를 하나의 Vercel 진입점에서 제공
- 개별 원본 저장소를 private로 전환해도 공개 포트폴리오 유지

## Projects

- PartnerFlow ERP — 거래처 접수·정산 통합 관리
- SupportOps AI — AI 고객문의·장애접수 운영 자동화
- PartnerOps — 멀티테넌트 파트너 운영 포털
- LMS Skin Change — 레거시 LMS 300화면 현대화

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run typecheck
npm run build
```

## Deployment

Vercel 배포용 Vite SPA입니다. `vercel.json`이 상세 프로젝트 경로를 SPA entry로 rewrite합니다.

현재 각 LIVE DEMO 버튼은 기존 GitHub Pages를 임시로 사용합니다. 각 프로젝트의 Vercel 공개 데모 이관이 끝난 뒤 URL을 교체하고 원본 저장소와 GitHub Pages를 비공개/비활성화합니다.


## Safe migration order

1. Import `porthub` into Vercel and confirm the production URL.
2. Deploy each portfolio demo from its own source repository to Vercel.
3. Replace the temporary GitHub Pages demo URLs in `src/data.ts`.
4. Re-run Porthub build verification and verify all four demo links.
5. Change `partnerflow-erp`, `SupportOps-AI`, `PartnerOps`, `LMS_Skin_change`, and `porthub` to private repositories.
6. Disable the old GitHub Pages workflows only after the Vercel demos are confirmed.
7. Keep the public portfolio URL direct-share only; `noindex, nofollow` is enabled by default.
