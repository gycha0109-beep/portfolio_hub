# Portfolio Export Contract

Porthub에 올라가는 것은 **원본 프로젝트가 아니라 공개 전용 정적 데모 패키지**입니다.

## Required package shape

```text
portfolio-export/
├─ index.html
├─ portfolio.json
├─ assets/...
├─ *.js / *.css
├─ images / video (optional)
└─ other static runtime files only
```

## Required `portfolio.json`

```json
{
  "schemaVersion": 1,
  "slug": "example-project",
  "order": 5,
  "title": "Example Project",
  "kicker": "한 줄 설명",
  "description": "공개용 프로젝트 설명",
  "category": "CATEGORY",
  "accent": "#4f7cff",
  "stack": ["React", "TypeScript"],
  "problem": "해결하려던 문제",
  "solution": "해결 방식",
  "evidence": ["검증 근거 1"],
  "scope": ["공개 구현 범위 1"],
  "preview": "erp"
}
```

`preview`는 현재 `erp | ai | ops | legacy` 중 하나입니다.

## Security gate

다음이 발견되면 publish가 실패합니다.

- `src/`, `docs/`, `tests/`, `scripts/`, migration/schema 등 원본 개발 디렉터리
- TypeScript, PHP, SQL, Python, Java, Go, Rust 등 원본 소스 확장자
- source map 및 `sourceMappingURL`
- `.env`, private key, certificate
- GitHub token / API key 패턴
- DB URL 또는 주요 secret environment assignment
- `gycha0109-beep` private source repository URL
- `index.html`의 `noindex` 누락

브라우저 실행에 필요한 minified/bundled JavaScript, CSS, HTML, 이미지, 영상은 허용합니다.

## Publishing model

각 private 프로젝트는 의도적으로 **수동** publish합니다.

```text
private repo
  → portfolio export 생성
  → artifact 업로드
  → public receiver workflow 호출
  → security gate
  → portfolio_hub/public/demos/<slug>
  → manifest 자동 갱신
  → Vercel 자동 배포
```

public `portfolio_hub`는 private repository를 읽을 권한을 갖지 않습니다.

## Required secret

각 private source repository에 다음 Actions secret 하나가 필요합니다.

`PORTFOLIO_HUB_TOKEN`

권장 권한은 **fine-grained PAT / repository access: portfolio_hub only / Contents: Read and write**입니다.

이 토큰은 source repository를 읽을 필요가 없습니다. 오직 공개 허브에 sanitised export를 쓰는 용도입니다.
