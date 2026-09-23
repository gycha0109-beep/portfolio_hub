import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Play,
} from 'lucide-react'
import { Link, Route, Routes, useParams } from 'react-router'
import { projectBySlug, projects, type Project } from './data'

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Porthub 홈">
      <span>PORT</span><b>HUB</b>
    </Link>
  )
}

function Preview({ type }: { type: Project['preview'] }) {
  if (type === 'ai') {
    return (
      <div className="preview-shell preview-ai">
        <div className="preview-top"><i /><i /><i /><span>Support queue</span></div>
        <div className="preview-body">
          <div className="ticket-list">
            <b>OPEN TICKETS</b>
            <span className="active">결제 오류 문의 <em>P1</em></span>
            <span>로그인 장애 <em>P2</em></span>
            <span>기능 문의 <em>P3</em></span>
          </div>
          <div className="ai-panel">
            <small>AI ANALYSIS</small>
            <strong>결제 실패 · 높은 우선순위</strong>
            <p>관련 운영 가이드를 근거로 답변 초안을 생성했습니다.</p>
            <div className="confidence"><span /></div>
            <button>사람 검토 필요</button>
          </div>
        </div>
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
                <Play size={16} fill="currentColor" /> LIVE DEMO <ExternalLink size={15} />
              </a>
              <Link className="secondary-button" to="/">목록으로 돌아가기</Link>
            </div>
          </div>

          <div className="detail-preview">
            <Preview type={project.preview} />
          </div>
        </div>

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
