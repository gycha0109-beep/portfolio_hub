import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Layers3,
  Play,
  ShieldCheck,
  Sparkles,
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
            <p>관련 운영 가이드 3건을 근거로 답변 초안을 생성했습니다.</p>
            <div className="confidence"><span style={{ width: '86%' }} /></div>
            <button>사람 검토 필요</button>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'legacy') {
    return (
      <div className="preview-shell preview-legacy">
        <div className="compare">
          <div><small>BEFORE</small><div className="old-ui"><span /><span /><span /><span /></div></div>
          <div><small>AFTER</small><div className="new-ui"><aside /><main><b /><span /><span /><span /></main></div></div>
        </div>
        <div className="migration-meter"><span>300 / 300 VERIFIED</span><i /></div>
      </div>
    )
  }

  if (type === 'ops') {
    return (
      <div className="preview-shell preview-ops">
        <div className="preview-top"><i /><i /><i /><span>Partner operations</span></div>
        <div className="ops-kpis"><span><small>PARTNERS</small><b>24</b></span><span><small>ACTIVE</small><b>21</b></span><span><small>ISSUES</small><b>03</b></span></div>
        <div className="ops-table">
          <header><span>Partner</span><span>Tenant</span><span>Access</span></header>
          {['Hanbit Network','Dream Mobile','Ace Connect'].map((name, index) => <p key={name}><b>{name}</b><span>T-{String(index + 1).padStart(3, '0')}</span><em>ISOLATED</em></p>)}
        </div>
      </div>
    )
  }

  return (
    <div className="preview-shell preview-erp">
      <div className="preview-top"><i /><i /><i /><span>PartnerFlow</span></div>
      <div className="erp-layout">
        <aside><b>PF</b><span className="on" /><span /><span /><span /></aside>
        <main>
          <div className="erp-kpis"><span><small>오늘 접수</small><b>18</b></span><span><small>처리 필요</small><b>07</b></span><span><small>정산 예정</small><b>₩3.4M</b></span></div>
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
        <a href="/#work">WORK</a>
        <a href="/#about">ABOUT</a>
      </nav>
      <span className="availability"><i /> AVAILABLE FOR PROJECTS</span>
    </header>
  )
}

function Home() {
  return (
    <main>
      <Header />
      <section className="hero">
        <div className="hero-meta"><span>PRODUCT ENGINEERING</span><span>SEOUL · KR</span></div>
        <h1>업무를 이해하고,<br /><em>작동하는 결과물</em>로 만듭니다.</h1>
        <p>실제 외주 요구사항을 제품 단위로 해석하고, 화면 설계부터 데이터 흐름·권한·자동 검증까지 구현합니다.</p>
        <a className="hero-cta" href="#work">프로젝트 보기 <ArrowRight size={18} /></a>
        <div className="hero-rule"><span>SELECTED WORK · 2026</span><b>04</b></div>
      </section>

      <section className="project-list" id="work">
        {projects.map((project) => (
          <article className="project-card" key={project.slug}>
            <Link className="project-link" to={`/work/${project.slug}`}>
              <div className="project-copy">
                <div className="project-index">{project.index} / 04</div>
                <div className="project-tags"><span>{project.category}</span><span>CASE STUDY</span></div>
                <h2>{project.title}</h2>
                <h3>{project.kicker}</h3>
                <p>{project.description}</p>
                <div className="stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
                <span className="view-project">VIEW PROJECT <ArrowRight size={17} /></span>
              </div>
              <div className="project-visual" style={{ '--accent': project.accent } as React.CSSProperties}>
                <Preview type={project.preview} />
              </div>
            </Link>
          </article>
        ))}
      </section>

      <section className="about" id="about">
        <div className="section-label">HOW I WORK</div>
        <div className="about-grid">
          <h2>예쁜 화면보다 먼저<br />업무의 <em>완료 조건</em>을 잡습니다.</h2>
          <div>
            <p>요구사항을 그대로 코딩하지 않습니다. 누가 어떤 데이터를 보고, 어떤 상태를 바꾸며, 어디까지 검증되어야 납품이라고 할 수 있는지 먼저 정의합니다.</p>
            <div className="principles">
              <span><b>01</b> 요구사항 → 업무 흐름</span>
              <span><b>02</b> 업무 흐름 → 데이터·권한</span>
              <span><b>03</b> 구현 → 자동 검증</span>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <Logo />
        <p>Built around real operational problems.</p>
        <span>© 2026</span>
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

  return (
    <main>
      <Header />
      <section className="detail-hero">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> ALL WORK</Link>
        <div className="detail-grid">
          <div>
            <div className="project-tags"><span>{project.category}</span><span>{project.index} / 04</span></div>
            <h1>{project.title}</h1>
            <h2>{project.kicker}</h2>
            <p>{project.description}</p>
            <a className="demo-button" href={project.demoUrl} target="_blank" rel="noreferrer"><Play size={17} fill="currentColor" /> LIVE DEMO <ExternalLink size={15} /></a>
          </div>
          <div className="detail-preview" style={{ '--accent': project.accent } as React.CSSProperties}><Preview type={project.preview} /></div>
        </div>
      </section>

      <section className="case-body">
        <div className="case-row">
          <div className="section-label">THE PROBLEM</div>
          <h3>{project.problem}</h3>
        </div>
        <div className="case-row">
          <div className="section-label">THE APPROACH</div>
          <div>
            <h3>{project.solution}</h3>
            <div className="scope-grid">{project.scope.map((item) => <span key={item}><Check size={15} /> {item}</span>)}</div>
          </div>
        </div>
        <div className="case-row evidence-row">
          <div className="section-label">EVIDENCE</div>
          <div className="evidence-grid">
            {project.evidence.map((item, index) => (
              <article key={item}>
                {index === 0 ? <Sparkles size={18} /> : index === 1 ? <ShieldCheck size={18} /> : <Layers3 size={18} />}
                <span>{item}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="case-row stack-row">
          <div className="section-label">STACK</div>
          <div className="stack large">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
      </section>

      <section className="next-project">
        <span>NEXT PROJECT</span>
        {(() => {
          const current = projects.findIndex((item) => item.slug === project.slug)
          const next = projects[(current + 1) % projects.length]
          return <Link to={`/work/${next.slug}`}><b>{next.title}</b><ArrowRight size={30} /></Link>
        })()}
      </section>

      <footer>
        <Logo />
        <p>Built around real operational problems.</p>
        <span>© 2026</span>
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
