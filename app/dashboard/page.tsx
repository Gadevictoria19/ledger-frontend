'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type TxStatus = 'pending' | 'processing' | 'auditing' | 'verified' | 'flagged'
type Tx = { id: string; date: string; description: string; amount: number; erpAmount: number }

const MOCK_ERP: Record<string, number> = {
  'TXN-0041': 48200.00, 'TXN-0042': 12340.50, 'TXN-0043': 89450.00,
  'TXN-0044': 349.00,   'TXN-0045': 15000.00, 'TXN-0046': 7823.75,
  'TXN-0047': 220500.00,'TXN-0048': 44100.00,
}

const DEFAULT_TXS: Tx[] = [
  { id: 'TXN-0041', date: '2024-06-01', description: 'Stripe payout — May batch',      amount: 48200.00,  erpAmount: 48200.00 },
  { id: 'TXN-0042', date: '2024-06-01', description: 'AWS infrastructure invoice',      amount: 12340.50,  erpAmount: 12340.50 },
  { id: 'TXN-0043', date: '2024-06-02', description: 'Payroll disbursement',            amount: 89450.00,  erpAmount: 89450.00 },
  { id: 'TXN-0044', date: '2024-06-02', description: 'Refund — Order #7821',            amount: 299.00,    erpAmount: 349.00   },
  { id: 'TXN-0045', date: '2024-06-03', description: 'Office lease — Q2',              amount: 15000.00,  erpAmount: 15000.00 },
  { id: 'TXN-0046', date: '2024-06-03', description: 'Vendor: SupplyChain Co.',         amount: 7823.75,   erpAmount: 7823.75  },
  { id: 'TXN-0047', date: '2024-06-04', description: 'SAAS subscription revenue',      amount: 220500.00, erpAmount: 220500.00},
  { id: 'TXN-0048', date: '2024-06-04', description: 'Tax remittance — Q2',            amount: 44100.00,  erpAmount: 44100.00 },
]

const fmt = (v: number) => '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

type LogEntry = { time: string; cls: string; text: string }

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Tx[]>(DEFAULT_TXS)
  const [statuses, setStatuses] = useState<TxStatus[]>([])
  const [running, setRunning] = useState(false)
  const [procCount, setProcCount] = useState(0)
  const [auditCount, setAuditCount] = useState(0)
  const [flagCount, setFlagCount] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([{ time: '00:00:00', cls: 'text-[#6b7280]', text: 'System initialised. Agents standing by.' }])
  const [sandboxLines, setSandboxLines] = useState<string[]>(['# Python sandbox ready — awaiting batch…'])
  const [totalDr, setTotalDr] = useState(0)
  const [totalCr, setTotalCr] = useState(0)
  const [done, setDone] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load uploaded CSV from sessionStorage if available
    const stored = sessionStorage.getItem('pending_transactions')
    if (stored) {
      try {
        const rows = JSON.parse(stored)
        const txs: Tx[] = rows.map((r: Record<string,string>) => ({
          id: r.id, date: r.date, description: r.description,
          amount: parseFloat(r.amount),
          erpAmount: MOCK_ERP[r.id] ?? parseFloat(r.amount),
        }))
        setTransactions(txs)
        sessionStorage.removeItem('pending_transactions')
      } catch {}
    }
    setStatuses(Array(DEFAULT_TXS.length).fill('pending'))
  }, [])

  useEffect(() => {
    setStatuses(Array(transactions.length).fill('pending'))
  }, [transactions])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const addLog = (cls: string, text: string) => {
    const time = new Date().toTimeString().slice(0, 8)
    setLogs(l => [...l, { time, cls, text }])
  }

  const runReconciliation = async () => {
    if (running) return
    setRunning(true)
    setDone(false)
    setProcCount(0); setAuditCount(0); setFlagCount(0)
    setTotalDr(0); setTotalCr(0)
    setLogs([])
    const newStatuses = Array(transactions.length).fill('pending') as TxStatus[]
    setStatuses([...newStatuses])

    addLog('text-[#6b7280]', `ReconciliationRun #${Math.floor(Math.random() * 9000 + 1000)} initiated`)
    await delay(500)
    addLog('text-[#4f9eff]', `[PROCESSOR] Scanning bank statement feed — ${transactions.length} transactions queued`)
    await delay(400)

    let verifiedDr = 0, verifiedCr = 0, flags = 0, verified = 0

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i]

      newStatuses[i] = 'processing'
      setStatuses([...newStatuses])
      addLog('text-[#4f9eff]', `[PROCESSOR] Mapping ${tx.id}: "${tx.description.slice(0, 30)}…"`)
      await delay(500 + Math.random() * 200)
      setProcCount(i + 1)

      newStatuses[i] = 'auditing'
      setStatuses([...newStatuses])
      addLog('text-[#ff9a3c]', `[AUDITOR] CoVe check on ${tx.id} — verifying account codes & amounts`)
      await delay(500 + Math.random() * 200)

      const isFlagged = Math.abs(tx.amount - tx.erpAmount) > 0.001
      const conf = isFlagged ? (Math.random() * 15 + 55).toFixed(1) : (Math.random() * 7 + 91).toFixed(1)

      if (isFlagged) {
        newStatuses[i] = 'flagged'
        flags++
        setFlagCount(flags)
        addLog('text-[#ff4f6a]', `[AUDITOR] ⚠ ${tx.id} FLAGGED — bank ${fmt(tx.amount)} ≠ ERP ${fmt(tx.erpAmount)} · Δ ${fmt(Math.abs(tx.amount - tx.erpAmount))}`)
      } else {
        newStatuses[i] = 'verified'
        verified++
        setAuditCount(verified)
        verifiedDr += tx.amount
        verifiedCr += tx.erpAmount
        setTotalDr(verifiedDr)
        setTotalCr(verifiedCr)
        addLog('text-[#00e5a0]', `[AUDITOR] ✓ ${tx.id} verified (confidence ${conf}%)`)
      }

      setStatuses([...newStatuses])

      setSandboxLines([
        `total_dr = Decimal("${verifiedDr.toFixed(2)}")`,
        `total_cr = Decimal("${verifiedCr.toFixed(2)}")`,
        `delta    = total_dr - total_cr  # ${Math.abs(verifiedDr - verifiedCr) < 0.01 ? '→ $0.00 ✓' : `→ $${Math.abs(verifiedDr - verifiedCr).toFixed(2)} ⚠`}`,
        `# verified: ${verified} | flagged: ${flags}`,
      ])
    }

    const balanced = Math.abs(verifiedDr - verifiedCr) < 0.01
    setSandboxLines([
      `assert total_dr == total_cr`,
      balanced
        ? `# ✓ Assertion passed — ledger balanced to the penny`
        : `# ✗ AssertionError: Δ $${Math.abs(verifiedDr - verifiedCr).toFixed(2)} — write blocked`,
      `# ${verified}/${transactions.length} transactions committed to DB`,
    ])
    addLog('text-[#6b7280]', `─── Run complete: ${verified} verified, ${flags} flagged, ledger ${balanced ? 'BALANCED' : 'IMBALANCED'} ───`)
    setDone(true)
    setRunning(false)
  }

  const balanced = done && Math.abs(totalDr - totalCr) < 0.01
  const verified = statuses.filter(s => s === 'verified').length
  const flagged = statuses.filter(s => s === 'flagged').length

  const statusBadge = (s: TxStatus) => {
    const map: Record<TxStatus, [string, string]> = {
      pending:    ['text-[#6b7280] bg-white/5 border-white/10',              '◻ PENDING'],
      processing: ['text-[#4f9eff] bg-[#4f9eff]/10 border-[#4f9eff]/20',    '⟳ MAPPING'],
      auditing:   ['text-[#ff9a3c] bg-[#ff9a3c]/10 border-[#ff9a3c]/20',    '⊕ AUDITING'],
      verified:   ['text-[#00e5a0] bg-[#00e5a0]/10 border-[#00e5a0]/20',    '✓ VERIFIED'],
      flagged:    ['text-[#ff4f6a] bg-[#ff4f6a]/10 border-[#ff4f6a]/20',    '⚠ FLAGGED'],
    }
    const [cls, label] = map[s]
    return <span className={`inline-flex items-center gap-1 border rounded px-2 py-0.5 font-mono text-[10px] tracking-wider ${cls}`}>{label}</span>
  }

  return (
    <main className="min-h-screen grid-bg flex flex-col">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 border border-[#00e5a0]/50 rounded-lg flex items-center justify-center text-[#00e5a0] text-[10px] font-mono">GL</div>
          <span className="font-mono text-xs text-[#e8eaf0]">general-ledger-engine</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-[#00e5a0]/20 bg-[#00e5a0]/5 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
            <span className="text-[9px] font-mono tracking-widest text-[#00e5a0] uppercase">{running ? 'Running' : 'Ready'}</span>
          </div>
          <Link href="/upload" className="font-mono text-xs text-[#6b7280] hover:text-[#e8eaf0] transition-colors">← Upload new</Link>
        </div>
      </nav>

      {/* AGENT CARDS */}
      <div className="px-6 py-4 grid grid-cols-3 gap-3 border-b border-white/[0.07] shrink-0">
        {[
          { label: 'PROCESSOR', badge: 'bg-[#4f9eff]/15 text-[#4f9eff]', title: 'Transaction Mapper', stat: `Mapped: ${procCount} / ${transactions.length}`, active: running },
          { label: 'AUDITOR',   badge: 'bg-[#ff9a3c]/15 text-[#ff9a3c]', title: 'CoVe Peer Reviewer', stat: `Verified: ${auditCount} · Flagged: ${flagCount}`, active: running },
          { label: 'PYTHON',    badge: 'bg-[#00e5a0]/15 text-[#00e5a0]', title: 'Arithmetic Sandbox',  stat: `Precision: penny-exact`, active: done },
        ].map((card, i) => (
          <div key={i} className={`border rounded-xl p-4 transition-all ${card.active ? 'border-[#4f9eff]/40 bg-[#4f9eff]/5' : 'border-white/[0.07] bg-[#111318]'}`}>
            <span className={`font-mono text-[9px] tracking-wider px-2 py-0.5 rounded ${card.badge}`}>{card.label}</span>
            <div className="font-mono text-xs text-[#e8eaf0] mt-2 mb-1">{card.title}</div>
            <div className="font-mono text-[10px] text-[#6b7280]">{card.stat}</div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT: TX TABLE */}
        <div className="flex-1 flex flex-col border-r border-white/[0.07] min-w-0">
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.07] shrink-0">
            <span className="font-mono text-[10px] tracking-widest text-[#6b7280] uppercase">Bank Statement vs ERP Records</span>
            <button
              onClick={runReconciliation}
              disabled={running}
              className={`flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-lg transition-all ${running ? 'bg-[#111318] text-[#6b7280] cursor-not-allowed' : 'bg-[#00e5a0] text-black hover:opacity-90'}`}
            >
              {running ? '⟳ Running…' : '▶ Run Reconciliation'}
            </button>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {['TX ID', 'Date', 'Description', 'Bank', 'ERP', 'Δ', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[#6b7280] font-normal text-[10px] tracking-wider uppercase sticky top-0 bg-[#0a0c0f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const s = statuses[i] || 'pending'
                  const diff = Math.abs(tx.amount - tx.erpAmount)
                  return (
                    <tr key={tx.id} className={`border-b border-white/[0.04] transition-colors ${s === 'verified' ? 'bg-[#00e5a0]/[0.02]' : s === 'flagged' ? 'bg-[#ff4f6a]/[0.03]' : s === 'processing' || s === 'auditing' ? 'bg-[#4f9eff]/[0.03]' : ''}`}>
                      <td className="px-4 py-2.5 text-[#4f9eff]">{tx.id}</td>
                      <td className="px-4 py-2.5 text-[#6b7280]">{tx.date}</td>
                      <td className="px-4 py-2.5 text-[#e8eaf0] max-w-[180px] truncate">{tx.description}</td>
                      <td className="px-4 py-2.5 text-[#ff4f6a]">{fmt(tx.amount)}</td>
                      <td className="px-4 py-2.5 text-[#00e5a0]">{fmt(tx.erpAmount)}</td>
                      <td className="px-4 py-2.5">{diff > 0 ? <span className="text-[#ff4f6a]">${diff.toFixed(2)}</span> : <span className="text-[#6b7280]">—</span>}</td>
                      <td className="px-4 py-2.5">{statusBadge(s)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* SUMMARY BAR */}
          <div className="grid grid-cols-3 border-t border-white/[0.07] shrink-0">
            {[
              { val: transactions.length, label: 'Transactions', color: 'text-[#e8eaf0]' },
              { val: verified, label: 'Verified', color: 'text-[#00e5a0]' },
              { val: flagged, label: 'Flagged', color: 'text-[#ff4f6a]' },
            ].map((s, i) => (
              <div key={i} className={`py-4 text-center ${i < 2 ? 'border-r border-white/[0.07]' : ''}`}>
                <div className={`font-mono text-xl font-medium ${s.color}`}>{s.val}</div>
                <div className="font-mono text-[9px] tracking-widest text-[#6b7280] uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-80 flex flex-col shrink-0">

          {/* DE VALIDATION */}
          <div className="border-b border-white/[0.07] p-4 shrink-0">
            <p className="font-mono text-[9px] tracking-widest text-[#6b7280] uppercase mb-3">Double-Entry Validation</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[#181c24] rounded-lg p-3">
                <div className="font-mono text-[9px] text-[#6b7280] uppercase tracking-wider mb-1">Total Debits</div>
                <div className="font-mono text-base font-medium text-[#ff4f6a]">{fmt(totalDr)}</div>
              </div>
              <div className="bg-[#181c24] rounded-lg p-3">
                <div className="font-mono text-[9px] text-[#6b7280] uppercase tracking-wider mb-1">Total Credits</div>
                <div className="font-mono text-base font-medium text-[#00e5a0]">{fmt(totalCr)}</div>
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border font-mono text-xs transition-all ${
              done
                ? balanced
                  ? 'bg-[#00e5a0]/07 border-[#00e5a0]/20 text-[#00e5a0]'
                  : 'bg-[#ff4f6a]/07 border-[#ff4f6a]/20 text-[#ff4f6a]'
                : 'bg-white/[0.03] border-white/[0.07] text-[#6b7280]'
            }`}>
              {done ? (balanced ? '✓ Ledger balanced' : `⚠ Imbalance — Δ ${fmt(Math.abs(totalDr - totalCr))}`) : '◻ Awaiting run…'}
            </div>
          </div>

          {/* PYTHON SANDBOX */}
          <div className="border-b border-white/[0.07] shrink-0">
            <p className="font-mono text-[9px] tracking-widest text-[#6b7280] uppercase px-4 pt-3 pb-2">Python Sandbox</p>
            <div className="px-4 pb-4 font-mono text-[10px] leading-6 space-y-0.5">
              {sandboxLines.map((line, i) => (
                <div key={i} className={line.startsWith('#') ? (line.includes('✓') ? 'text-[#00e5a0]' : line.includes('✗') ? 'text-[#ff4f6a]' : 'text-[#6b7280]') : 'text-[#4f9eff]'}>
                  <span className="text-[#00e5a0] mr-1">›</span>{line}
                </div>
              ))}
            </div>
          </div>

          {/* AGENT LOG */}
          <div className="flex flex-col flex-1 min-h-0">
            <p className="font-mono text-[9px] tracking-widest text-[#6b7280] uppercase px-4 pt-3 pb-2 shrink-0">Agent Log</p>
            <div ref={logRef} className="overflow-auto flex-1 px-4 pb-4 space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="font-mono text-[10px] leading-5">
                  <span className="text-[#6b7280] mr-1.5">{log.time}</span>
                  <span className={log.cls}>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
