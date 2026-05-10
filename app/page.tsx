'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    icon: '⟳',
    title: 'Chain-of-Verification',
    desc: 'Auditor Agent independently re-derives every mapping. Hallucinations blocked before any DB write.',
    color: 'var(--warn)',
  },
  {
    icon: '⊕',
    title: 'Multi-Agent Pipeline',
    desc: 'Processor maps. Auditor reviews. Python sandbox validates. Three layers of correctness.',
    color: 'var(--accent2)',
  },
  {
    icon: '✦',
    title: 'Penny-Exact Arithmetic',
    desc: 'Decimal arithmetic, ROUND_HALF_UP. assert DR == CR or the write is blocked. No float drift.',
    color: 'var(--accent)',
  },
  {
    icon: '◈',
    title: 'Stateful Orchestration',
    desc: 'LangGraph manages agent state across the full reconciliation run. No dropped context.',
    color: '#c084fc',
  },
]

const STACK = ['Next.js 14', 'Python 3.11', 'FastAPI', 'Claude API', 'LangGraph', 'PostgreSQL', 'Decimal', 'Pydantic']

const LOG_LINES = [
  { cls: 'text-[#6b7280]', text: '00:00:01  System initialised. Agents standing by.' },
  { cls: 'text-[#4f9eff]', text: '00:00:02  [PROCESSOR] Mapping TXN-0041: "Stripe payout — May batch"' },
  { cls: 'text-[#ff9a3c]', text: '00:00:03  [AUDITOR] CoVe check on TXN-0041 — verifying account codes' },
  { cls: 'text-[#00e5a0]', text: '00:00:04  [AUDITOR] ✓ TXN-0041 verified (confidence 96.2%)' },
  { cls: 'text-[#4f9eff]', text: '00:00:05  [PROCESSOR] Mapping TXN-0044: "Refund — Order #7821"' },
  { cls: 'text-[#ff9a3c]', text: '00:00:06  [AUDITOR] CoVe check on TXN-0044 — verifying account codes' },
  { cls: 'text-[#ff4f6a]', text: '00:00:07  [AUDITOR] ⚠ TXN-0044 FLAGGED — bank $299.00 ≠ ERP $349.00 · Δ $50.00' },
  { cls: 'text-[#00e5a0]', text: '00:00:08  [SANDBOX] ✓ Assertion passed — DR == CR — ledger balanced' },
  { cls: 'text-[#6b7280]', text: '00:00:09  Run complete: 7 verified, 1 flagged, ledger BALANCED ───' },
]

export default function Home() {
  const [visibleLines, setVisibleLines] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisibleLines(v => {
        if (v >= LOG_LINES.length) {
          setTimeout(() => setVisibleLines(0), 2000)
          return v
        }
        return v + 1
      })
    }, 600)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <main className="min-h-screen grid-bg">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#00e5a0]/50 rounded-lg flex items-center justify-center text-[#00e5a0] text-xs font-mono">GL</div>
          <span className="font-mono text-sm text-[#e8eaf0]">general-ledger-engine</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/Gadevictoria19/general-ledger-engine" target="_blank" className="text-[#6b7280] hover:text-[#e8eaf0] text-xs font-mono transition-colors">GitHub ↗</a>
          <Link href="/upload" className="text-xs font-mono px-4 py-2 border border-[#00e5a0]/30 text-[#00e5a0] rounded-lg hover:bg-[#00e5a0]/10 transition-all">Try it →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 border border-[#00e5a0]/20 bg-[#00e5a0]/5 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-[#00e5a0] uppercase">Multi-Agent · CoVe Architecture · LangGraph</span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-6 glow-text" style={{ color: '#e8eaf0' }}>
          Autonomous<br />
          <span style={{ color: 'var(--accent)' }}>General Ledger</span><br />
          Engine
        </h1>

        <p className="font-mono text-sm text-[#6b7280] max-w-xl leading-relaxed mb-10">
          A production-grade multi-agent system that reconciles bank statements against ERP records.
          Every mapping peer-reviewed by a CoVe Auditor Agent. Every ledger validated to the penny before any DB write.
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/upload" className="flex items-center gap-2 bg-[#00e5a0] text-black font-mono text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
            Upload CSV & Reconcile
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 border border-white/10 text-[#e8eaf0] font-mono text-sm px-6 py-3 rounded-lg hover:bg-white/5 transition-all">
            View Dashboard
          </Link>
        </div>
      </section>

      {/* LIVE LOG TERMINAL */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <div className="border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-[#111318]">
            <div className="w-3 h-3 rounded-full bg-[#ff4f6a]/60" />
            <div className="w-3 h-3 rounded-full bg-[#ff9a3c]/60" />
            <div className="w-3 h-3 rounded-full bg-[#00e5a0]/60" />
            <span className="ml-3 text-[10px] font-mono text-[#6b7280] tracking-wider">agent-communication-log</span>
          </div>
          <div className="bg-[#0a0c0f] p-6 h-64 overflow-hidden font-mono text-xs leading-7">
            {LOG_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={`${line.cls} transition-all duration-300`}>
                {line.text}
              </div>
            ))}
            <span className="inline-block w-2 h-4 bg-[#00e5a0] animate-pulse ml-0.5 align-middle" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <p className="text-[10px] font-mono tracking-widest text-[#6b7280] uppercase mb-8">Architecture</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="border border-white/[0.07] rounded-xl p-6 bg-[#111318] hover:border-white/20 transition-colors group">
              <div className="text-2xl mb-4" style={{ color: f.color }}>{f.icon}</div>
              <div className="font-mono text-sm font-medium text-[#e8eaf0] mb-2">{f.title}</div>
              <div className="font-mono text-xs text-[#6b7280] leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STACK */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <p className="text-[10px] font-mono tracking-widest text-[#6b7280] uppercase mb-6">Stack</p>
        <div className="flex flex-wrap gap-2">
          {STACK.map(s => (
            <span key={s} className="border border-white/[0.07] bg-[#111318] text-[#e8eaf0] font-mono text-xs px-3 py-1.5 rounded-lg">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.07] px-8 py-6 flex items-center justify-between">
        <span className="font-mono text-xs text-[#6b7280]">general-ledger-engine · MIT License</span>
        <a href="https://github.com/Gadevictoria19/general-ledger-engine" target="_blank" className="font-mono text-xs text-[#6b7280] hover:text-[#e8eaf0] transition-colors">github.com/Gadevictoria19 ↗</a>
      </footer>

    </main>
  )
}
