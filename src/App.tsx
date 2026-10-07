import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  FileText,
  Images,
  LayoutList,
  Lightbulb,
  Play,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Link, Route, Routes, useParams } from 'react-router'
import { projectBySlug, projects, type Project } from './data'
import './proposal.css'

const proposalSteps = [
  { index: '01', title: 'RFP 분석', note: '요구사항 추출', icon: FileText },
  { index: '02', title: '근거 자료 검색', note: '과거 제안서 탐색', icon: Search },
  { index: '03', title: '제안 전략 생성', note: '컨셉·방향성 도출', icon: Lightbulb },
  { index: '04', title: '페이지 구성', note: '목차·장표 흐름 설계', icon: LayoutList },
  { index: '05', title: '장표 초안 작성', note: '텍스트·시각 자료 기획', icon: Images },
  { index: '06', title: '검증 및 수정', note: '근거 검증·부분 재작성', icon: ShieldCheck },
]

const proposalRequirements = [
  ['R-201', '통합 마케팅 전략 수립', 'PAGE 02'],
  ['R-202', '디지털 채널 운영 방안', 'PAGE 03'],
  ['R-203', '영상 콘텐츠 제작', 'PAGE 04'],
  ['R-204', '온/오프라인 연계 방안', 'PAGE 05'],
  ['R-205', '캠페인 운영 계획', 'PAGE 06'],
  ['R-206', '성과 측정 및 분석 체계', 'PAGE 07'],
]

const proposalSlides = [
  ['01', '제안 개요', 'overview'],
  ['02', '현황 분석', 'bars'],
  ['03', '전략 방향', 'radial'],
  ['04', '추진 계획', 'flow'],
  ['05', '성과 측정', 'chart'],
]

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Porthub 홈">
      <span>PORT</span><b>HUB</b>
    </Link>
  )
}

function Preview({ type }: { type: Project['preview'] }) {
  if (type === 'commerce') {
    return (
      <div className="preview-shell cover-shell">
        <img className="cover-image" src="/demos/mode-atelier/screenshots/home-1440.jpg" alt="Mode Atelier Shopify 스토어 홈 화면" />
      </div>
    )
  }

  if (type === 'security') {
    return (
      <div className="preview-shell preview-security">
        <div className="security-preview-head">
          <div><small>AI APP HARDENING</small><b>VibeGuard</b></div>
          <i>5 FIXED</i>
        </div>
        <div className="security-preview-metrics">
          <span><small>FOUND</small><b>5</b></span>
          <span><small>FIXED</small><b>5</b></span>
          <span><small>FINAL</small><b>PASS</b></span>
        </div>
        <div className="security-preview-flow">
          <p><b>01</b><span>투표 기록 위조 경로</span><i>FIXED</i></p>
          <p><b>02</b><span>비공개 이미지 노출</span><i>FIXED</i></p>
          <p><b>03</b><span>투표·이벤트 불일치</span><i>FIXED</i></p>
          <p><b>04</b><span>lint · test · build</span><i>PASS</i></p>
        </div>
      </div>
    )
  }

  if (type === 'proposal') {
    return (
      <div className="preview-shell preview-proposal">
        <div className="proposal-preview-head">
          <small>PROPOSAL OPS</small>
          <b>Evidence-grounded workflow</b>
          <i>6 / 6</i>
        </div>
        <div className="proposal-preview-flow">
          <span>RFP</span><em />
          <span>RETRIEVE</span><em />
          <span>EVIDENCE</span><em />
          <span>STRATEGY</span>
        </div>
        <div className="proposal-preview-main">
          <div className="proposal-preview-column">
            <p><b>01</b><span>Coverage validator</span><i>PASS</i></p>
            <p><b>02</b><span>Slide provenance</span><i>PASS</i></p>
            <p><b>03</b><span>Semantic QA</span><i>GUARD</i></p>
          </div>
          <div className="proposal-preview-card">
            <small>GROUNDING CHECK</small>
            <strong>잘못 연결된 근거 자동 차단</strong>
            <div><span>OFF_PAGE_EVIDENCE</span><b>BLOCK</b></div>
            <div><span>INVALID_REFERENCE</span><b>BLOCK</b></div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'ledger') {
    return (
      <div className="preview-shell preview-ledger">
        <div className="ledger-side">
          <b>CL</b>
          <span className="on" />
          <span />
          <span />
          <span />
        </div>
        <div className="ledger-main">
          <div className="ledger-head">
            <div><small>ACCOUNTING OPS</small><b>회계 전송 워크벤치</b></div>
            <i>READY</i>
          </div>
          <div className="ledger-flow">
            <span className="done">Excel</span><em />
            <span className="done">검토</span><em />
            <span className="active">승인</span><em />
            <span>전송</span><em />
            <span>대사</span>
          </div>
          <div className="ledger-kpis">
            <span><small>IMPORT</small><b>3</b></span>
            <span><small>REVIEW</small><b>0</b></span>
            <span><small>EXPENSE</small><b>₩286K</b></span>
          </div>
          <div className="ledger-table">
            <p><i /><span /><b>₩181,111</b></p>
            <p><i /><span /><b>₩72,222</b></p>
            <p><i /><span /><b>₩33,333</b></p>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'ai') {
    return (
      <div className="preview-shell cover-shell">
        <img className="cover-image" src="/covers/supportops.webp?v=1" alt="SupportOps AI 포트폴리오 표지" />
      </div>
    )
  }

  if (type === 'legacy') {
    return (
      <div className="preview-shell cover-shell">
        <img className="cover-image" src="/covers/lms.webp?v=3" alt="LMS Skin Change 포트폴리오 표지" />
      </div>
    )
  }

  if (type === 'ops') {
    return (
      <div className="preview-shell cover-shell">
        <img className="cover-image" src="/covers/partnerops.webp?v=3" alt="PartnerOps 포트폴리오 표지" />
      </div>
    )
  }

  return (
    <div className="preview-shell preview-erp">
      <div className="erp-layout">
        <aside><b>PF</b><span className="on" /><span /><span /><span /></aside>
        <main>
          <div className="erp-kpis">
            <span><small>오늘 접수</small><b>18</b></span>
            <span><small>처리 필요</small><b>07</b></span>
            <span><small>정산 예정</small><b>₩3.4M</b></span>
          </div>
          <div className="erp-table"><header /><p /><p /><p /></div>
        </main>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="site-header">
      <Logo />
      <nav>
        <a href="/#work">프로젝트</a>
        <a href="/#about">소개</a>
      </nav>
      <span className="availability"><i /> 프로젝트 문의 가능합니다</span>
    </header>
  )
}

function Home() {
  return (
    <main>
      <Header />

      <section className="home-hero" id="about">
        <span className="eyebrow">PORTFOLIO</span>
        <h1>업무를 이해하고,<br /><em>작동하는 결과물</em>로 만듭니다.</h1>
        <p>실제 업무 요구사항을 제품 단위로 해석하고, 화면 설계부터 데이터 흐름·권한·자동 검증까지 구현합니다.</p>
        <a className="primary-button" href="#work">프로젝트 둘러보기 <ArrowRight size={17} /></a>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PROJECTS</span>
            <h2>주요 프로젝트</h2>
          </div>
          <span>{projects.length}개의 작업</span>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <Link className="work-card" to={`/work/${project.slug}`} key={project.slug}>
              <div className="work-preview">
                <Preview type={project.preview} />
              </div>
              <div className="work-card-body">
                <span className="card-number">{project.index}</span>
                <h3>{project.title}</h3>
                <p>{project.kicker}</p>
                <div className="stack">
                  {project.stack.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
                </div>
                <div className="card-link">자세히 보기 <ArrowRight size={16} /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="simple-footer">
        <Logo />
        <span>실무에서 출발하는, 실제로 작동하는 결과물.</span>
        <span>© 2026 Porthub</span>
      </footer>
    </main>
  )
}

function ProposalProductMock() {
  return (
    <div className="proposal-product">
      <div className="proposal-product-inputs">
        <div className="proposal-source-card">
          <div className="proposal-source-icon"><FileText size={18} /></div>
          <div>
            <small>INPUT 01</small>
            <strong>과업지시서 (RFP)</strong>
            <span>RFP-TEST-002.pdf</span>
          </div>
        </div>
        <div className="proposal-source-card">
          <div className="proposal-source-icon"><FileText size={18} /></div>
          <div>
            <small>INPUT 02</small>
            <strong>과거 우수 제안서</strong>
            <span>PPT · PDF · 문서</span>
          </div>
        </div>
      </div>

      <div className="proposal-app-window">
        <aside className="proposal-app-nav">
          <b>ProposalOps <i>AI</i></b>
          <span className="active">RFP 분석</span>
          <span>근거 자료 검색</span>
          <span>제안 전략</span>
          <span>페이지 구성</span>
          <span>슬라이드 초안</span>
          <span>검증 및 수정</span>
        </aside>

        <div className="proposal-app-main">
          <div className="proposal-app-toolbar">
            <b>RFP-TEST-002</b>
            <span>완료</span>
          </div>

          <div className="proposal-app-slide">
            <div>
              <small>PROPOSAL DRAFT</small>
              <h3>제안 개요</h3>
              <p>요구사항과 과거 수행 근거를 연결해 제안 방향과 장표 초안을 구성합니다.</p>
            </div>
            <div className="proposal-app-art">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="proposal-app-bottom">
            <div className="proposal-app-requirements">
              <small>요구사항 반영</small>
              {proposalRequirements.slice(0, 4).map(([id, title]) => (
                <p key={id}><Check size={11} /><b>{id}</b><span>{title}</span></p>
              ))}
            </div>
            <div className="proposal-app-thumbs">
              {proposalSlides.slice(0, 4).map(([id]) => <i key={id}>{id}</i>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProposalSlideVisual({ kind }: { kind: string }) {
  if (kind === 'overview') {
    return (
      <div className="proposal-slide-canvas overview">
        <div><small>PROPOSAL</small><b>제안 개요</b><span>데이터 기반 통합 마케팅 제안</span></div>
        <i />
      </div>
    )
  }

  if (kind === 'bars') {
    return (
      <div className="proposal-slide-canvas bars">
        <b>현황 분석</b>
        <div><i /><i /><i /><i /></div>
      </div>
    )
  }

  if (kind === 'radial') {
    return (
      <div className="proposal-slide-canvas radial">
        <b>전략 방향</b>
        <div><i /><span /><span /><span /></div>
      </div>
    )
  }

  if (kind === 'flow') {
    return (
      <div className="proposal-slide-canvas flow">
        <b>추진 계획</b>
        <div><span>01</span><em /><span>02</span><em /><span>03</span></div>
      </div>
    )
  }

  return (
    <div className="proposal-slide-canvas chart">
      <b>성과 측정</b>
      <div><i /><i /><i /><i /><i /></div>
    </div>
  )
}

function ProposalDetail({ project, next }: { project: Project; next: Project }) {
  return (
    <main>
      <Header />

      <section className="detail proposal-detail-page">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> 전체 프로젝트</Link>

        <section className="proposal-hero">
          <div className="proposal-hero-copy">
            <span className="proposal-kicker">AI PROPOSAL AUTOMATION</span>
            <h1>RFP를 넣으면,<br /><em>근거 있는 제안서 초안</em>이<br />자동으로 완성됩니다.</h1>
            <p>과업지시서를 분석하고 과거 우수 제안서에서 관련 레퍼런스를 찾아, 제안 전략·목차·장표 텍스트 초안·이미지 생성 프롬프트까지 하나의 흐름으로 만듭니다.</p>
            <div className="proposal-hero-actions">
              <a className="primary-button" href={project.demoUrl} target="_blank" rel="noreferrer">
                <Play size={16} fill="currentColor" /> 데모 결과 보기
              </a>
              <a className="secondary-button" href="https://github.com/gycha0109-beep/ProposalOps-AI" target="_blank" rel="noreferrer">
                GitHub 보기
              </a>
            </div>
          </div>

          <ProposalProductMock />
        </section>

        <section className="proposal-section proposal-process-section">
          <div className="proposal-section-heading">
            <span>01. 전체 프로세스</span>
            <h2>RFP부터 제안서 초안까지, 6단계 자동화</h2>
            <p>검색과 생성 사이에 근거 연결을 두고, 마지막에는 근거 범위를 다시 검증합니다.</p>
          </div>

          <div className="proposal-step-row">
            {proposalSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div className="proposal-step" key={step.index}>
                  <div className="proposal-step-icon"><Icon size={22} /></div>
                  <small>{step.index}</small>
                  <b>{step.title}</b>
                  <span>{step.note}</span>
                  {index < proposalSteps.length - 1 && <ArrowRight className="proposal-step-arrow" size={16} />}
                </div>
              )
            })}
          </div>
        </section>

        <section className="proposal-section proposal-result-section">
          <div className="proposal-section-heading compact">
            <span>02. 실제 결과</span>
            <h2>신규 RFP를 기반으로 생성된 제안서 예시</h2>
          </div>

          <div className="proposal-slide-grid">
            {proposalSlides.map(([id, title, kind]) => (
              <figure className="proposal-slide-preview" key={id}>
                <ProposalSlideVisual kind={kind} />
                <figcaption><small>{id}.</small> {title}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <div className="proposal-two-column">
          <section className="proposal-section proposal-coverage-section">
            <div className="proposal-section-heading compact">
              <span>03. 요구사항 반영 결과</span>
              <h2>모든 필수 요구사항이 제안서에 반영됐습니다.</h2>
            </div>

            <div className="proposal-coverage-layout">
              <div className="proposal-requirement-list">
                {proposalRequirements.map(([id, title, page]) => (
                  <div key={id}>
                    <Check size={14} />
                    <b>{id}</b>
                    <span>{title}</span>
                    <strong>{page}</strong>
                  </div>
                ))}
              </div>

              <div className="proposal-metrics">
                <div><small>필수 요구사항 반영</small><b>6 / 6</b></div>
                <div><small>누락 요구사항</small><b>0</b></div>
                <div><small>생성 페이지 수</small><b>7</b><span>제한 ≤ 8</span></div>
                <div><small>근거 없는 주장</small><b>0건</b></div>
              </div>
            </div>
          </section>

          <section className="proposal-section proposal-validation-section">
            <div className="proposal-section-heading compact">
              <span>04. 근거 기반 검증</span>
              <h2>AI가 없는 내용을 만들지 않도록 검증합니다.</h2>
              <p>실제 evidence가 지원하는 범위를 넘으면 차단하고, 문제가 생긴 범위만 다시 작성합니다.</p>
            </div>

            <div className="proposal-validation-flow">
              <div className="proposal-validation-card invalid">
                <small>잘못된 AI 초안</small>
                <blockquote>“지도·예약 연계를 통해 방문 전환을 높입니다.”</blockquote>
                <b>INVALID_REFERENCE</b>
              </div>

              <ArrowRight className="proposal-validation-arrow" size={22} />

              <div className="proposal-validation-card valid">
                <small>실제 근거 자료</small>
                <blockquote>“공식 채널과 크리에이터의 역할을 분리하여 운영합니다.”</blockquote>
                <b><Check size={14} /> 해당 부분만 재작성</b>
              </div>
            </div>
          </section>
        </div>

        <Link className="next-card" to={`/work/${next.slug}`}>
          <span>다음 프로젝트</span>
          <b>{next.title}</b>
          <ArrowRight size={24} />
        </Link>
      </section>

      <footer className="simple-footer">
        <Logo />
        <span>실무에서 출발하는, 실제로 작동하는 결과물.</span>
        <span>© 2026 Porthub</span>
      </footer>
    </main>
  )
}

function ProjectDetail() {
  const { slug } = useParams()
  const project = projectBySlug(slug)

  if (!project) {
    return (
      <main className="not-found">
        <Logo />
        <h1>Project not found.</h1>
        <Link to="/">Back to Porthub</Link>
      </main>
    )
  }

  const current = projects.findIndex((item) => item.slug === project.slug)
  const next = projects[(current + 1) % projects.length]

  if (project.slug === 'proposalops') {
    return <ProposalDetail project={project} next={next} />
  }

  return (
    <main>
      <Header />

      <section className="detail">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> 전체 프로젝트</Link>

        <div className="detail-hero">
          <div className="detail-copy">
            <span className="category-pill">{project.category}</span>
            <h1>{project.title}</h1>
            <h2>{project.kicker}</h2>
            <p>{project.description}</p>
            <div className="detail-actions">
              <a className="primary-button" href={project.demoUrl} target="_blank" rel="noreferrer">
                <Play size={16} fill="currentColor" /> {project.slug === 'mode-atelier' ? 'CASE STUDY' : 'LIVE DEMO'} <ExternalLink size={15} />
              </a>
              {project.slug === 'mode-atelier' && (
                <a
                  className="secondary-button"
                  href="https://mode-atelier-fluhoiwk.myshopify.com?preview_theme_id=188330770750"
                  target="_blank"
                  rel="noreferrer"
                >
                  실제 Shopify 스토어 <ExternalLink size={15} />
                </a>
              )}
              <Link className="secondary-button" to="/">목록으로 돌아가기</Link>
            </div>
            {project.slug === 'mode-atelier' && (
              <p className="demo-access-note">
                Shopify Dev Store · Demo password <code>modeatelier</code>
              </p>
            )}
          </div>

          <div className="detail-preview">
            <Preview type={project.preview} />
          </div>
        </div>

        {project.slug === 'careledger' && (
          <section className="demo-video-section" aria-labelledby="careledger-demo-video-title">
            <div className="demo-video-heading">
              <div>
                <span className="eyebrow">DEMO VIDEO</span>
                <h3 id="careledger-demo-video-title">실제 업무 흐름 시연</h3>
              </div>
              <p>CareLedger 포트폴리오 시연 화면에서 Excel 불러오기부터 검토·승인·전송·실패 건 재전송·최종 확인까지 핵심 흐름을 진행합니다.</p>
            </div>
            <video
              className="demo-video"
              controls
              preload="metadata"
              poster="/demos/careledger/careledger-demo-poster.webp"
            >
              <source src="/demos/careledger/careledger-demo.mp4" type="video/mp4" />
              브라우저에서 MP4 영상을 재생할 수 없습니다.
            </video>
            <p className="demo-video-note">실제 희망이음 운영 시스템이 아닌 독립 테스트 연동 환경에서 촬영한 시연입니다.</p>
          </section>
        )}

        <div className="detail-content">
          <article className="info-block">
            <span>01</span>
            <h3>문제</h3>
            <strong>{project.problem}</strong>
          </article>

          <article className="info-block">
            <span>02</span>
            <h3>해결 방식</h3>
            <strong>{project.solution}</strong>
          </article>

          <article className="info-block scope-block">
            <span>03</span>
            <h3>구현 범위</h3>
            <div className="scope-list">
              {project.scope.map((item) => <div key={item}><Check size={16} /> {item}</div>)}
            </div>
          </article>

          <article className="info-block evidence-block">
            <span>04</span>
            <h3>검증 근거</h3>
            <div className="evidence-list">
              {project.evidence.map((item) => <div key={item}>{item}</div>)}
            </div>
          </article>

          <article className="info-block stack-block">
            <span>05</span>
            <h3>기술 스택</h3>
            <div className="stack large">
              {project.stack.map((item) => <span key={item}>{item}</span>)}
            </div>
          </article>
        </div>

        <Link className="next-card" to={`/work/${next.slug}`}>
          <span>다음 프로젝트</span>
          <b>{next.title}</b>
          <ArrowRight size={24} />
        </Link>
      </section>

      <footer className="simple-footer">
        <Logo />
        <span>실무에서 출발하는, 실제로 작동하는 결과물.</span>
        <span>© 2026 Porthub</span>
      </footer>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/work/:slug" element={<ProjectDetail />} />
    </Routes>
  )
}
