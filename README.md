# Porthub

외주·프로젝트 클라이언트에게 공개하는 통합 포트폴리오 허브입니다.

> Repository: `portfolio_hub`  
> Public brand: **Porthub**

## Architecture

```text
PUBLIC
portfolio_hub
└─ Porthub UI
   └─ exported static demos only
      ├─ partnerflow
      ├─ supportops
      ├─ partnerops
      └─ lms

PRIVATE
├─ <portfolio-source-01>
├─ <portfolio-source-02>
├─ <portfolio-source-03>
└─ <future-portfolio-source...>
```

Porthub는 Vercel에 단일 프로젝트로 배포합니다. 원본 프로젝트 저장소를 별도 Vercel 프로젝트로 각각 배포하지 않습니다.

## Security boundary

공개 `portfolio_hub`에는 다음만 포함합니다.

- 포트폴리오 허브 UI
- 클라이언트에게 보여줄 설명·기술 스택·검증 결과
- 공개용 synthetic data
- 실행 가능한 정적 데모 산출물
- 공개용 영상·스크린샷

다음은 포함하지 않습니다.

- 원본 프로젝트 source
- 내부 설계 문서 전체
- DB migration / production schema 원본
- credential / secret / environment value
- private repository URL을 노출하는 UI
- 불필요한 Git history 또는 개발용 artifact

## Projects

- PartnerFlow ERP — 거래처 접수·정산 통합 관리
- SupportOps AI — AI 고객문의·장애접수 운영 자동화
- PartnerOps — 멀티테넌트 파트너 운영 포털
- LMS Skin Change — 레거시 LMS 300화면 현대화

## Deployment model

```text
private project
   ↓
portfolio-safe static export
   ↓
portfolio_hub/public/demos/<slug>
   ↓
one Vercel deployment
   ↓
porthub-neon.vercel.app/demo/<slug>/
```

프로젝트가 추가되어도 Vercel 프로젝트를 새로 만들지 않습니다. 신규 프로젝트는 Porthub 프로젝트 목록과 정적 데모 export만 추가합니다.

## CI policy

`portfolio_hub`는 GitHub Actions 사용 정책상 public repository로 유지합니다.

공개 CI는 다음 원칙을 따릅니다.

- secret이 필요한 workflow는 fork PR에서 실행하지 않음
- private source를 공개 artifact로 업로드하지 않음
- Porthub에는 정적 export 결과만 반영
- 모든 공개 데모에는 `noindex, nofollow` 적용

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

## Current deployment state

Porthub는 현재 네 개의 portfolio-safe static export를 저장소 내부 `public/demos/<slug>`에서 직접 서빙합니다.

```text
private source repo
  → manual Publish Portfolio Demo
  → security gate
  → portfolio_hub/public/demos/<slug>
  → manifest update
  → Vercel automatic deployment
```

외부 GitHub Pages origin이나 프로젝트별 Vercel deployment는 사용하지 않습니다.

현재 완료된 전환:

1. portfolio-safe static export 규격 통일
2. 정적 데모 4개를 Porthub 단일 배포에 포함
3. 외부 GitHub Pages proxy 제거
4. 기존 GitHub Pages deployment workflow 제거
5. 프로젝트별 임시 Vercel config 제거
6. Porthub 전체 demo registry 보안검사 및 build 검증

남은 운영 단계는 원본 포트폴리오 저장소를 private로 유지하는 것입니다.
