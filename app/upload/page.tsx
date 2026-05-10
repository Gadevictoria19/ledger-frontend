'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const SAMPLE_CSV = `id,date,description,amount
TXN-0041,2024-06-01,Stripe payout — May batch,48200.00
TXN-0042,2024-06-01,AWS infrastructure invoice,12340.50
TXN-0043,2024-06-02,Payroll disbursement,89450.00
TXN-0044,2024-06-02,Refund — Order #7821,299.00
TXN-0045,2024-06-03,Office lease — Q2,15000.00
TXN-0046,2024-06-03,Vendor: SupplyChain Co.,7823.75
TXN-0047,2024-06-04,SAAS subscription revenue,220500.00
TXN-0048,2024-06-04,Tax remittance — Q2,44100.00`

type ParsedRow = { id: string; date: string; description: string; amount: string }

export default function UploadPage() {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim())
      return headers.reduce((obj, h, i) => ({ ...obj, [h]: vals[i] }), {}) as ParsedRow
    })
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file'); return }
    setError('')
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = parseCSV(e.target?.result as string)
        setRows(parsed)
      } catch {
        setError('Could not parse CSV — check the format')
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const loadSample = () => {
    setFileName('sample_bank_statement.csv')
    setRows(parseCSV(SAMPLE_CSV))
    setError('')
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'sample_bank_statement.csv'; a.click()
  }

  const runReconciliation = () => {
    if (!rows.length) return
    // Store in sessionStorage for dashboard to read
    sessionStorage.setItem('pending_transactions', JSON.stringify(rows))
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen grid-bg">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.07]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#00e5a0]/50 rounded-lg flex items-center justify-center text-[#00e5a0] text-xs font-mono">GL</div>
          <span className="font-mono text-sm text-[#e8eaf0]">general-ledger-engine</span>
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs text-[#6b7280]">
          <Link href="/" className="hover:text-[#e8eaf0] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#00e5a0]">Upload</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-16">
        <p className="text-[10px] font-mono tracking-widest text-[#6b7280] uppercase mb-4">Step 1 of 2</p>
        <h1 className="font-serif text-4xl text-[#e8eaf0] mb-2">Upload Bank Statement</h1>
        <p className="font-mono text-xs text-[#6b7280] mb-10">CSV with columns: id, date, description, amount</p>

        {/* DROP ZONE */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6 ${
            dragging
              ? 'border-[#00e5a0] bg-[#00e5a0]/5'
              : rows.length
              ? 'border-[#00e5a0]/40 bg-[#00e5a0]/5'
              : 'border-white/10 hover:border-white/20 bg-[#111318]'
          }`}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
          {rows.length ? (
            <>
              <div className="text-[#00e5a0] text-3xl mb-3">✓</div>
              <div className="font-mono text-sm text-[#00e5a0] mb-1">{fileName}</div>
              <div className="font-mono text-xs text-[#6b7280]">{rows.length} transactions parsed</div>
            </>
          ) : (
            <>
              <div className="text-[#6b7280] text-3xl mb-3">↑</div>
              <div className="font-mono text-sm text-[#e8eaf0] mb-1">Drop CSV here or click to browse</div>
              <div className="font-mono text-xs text-[#6b7280]">Bank statement · .csv format</div>
            </>
          )}
        </div>

        {error && <p className="font-mono text-xs text-[#ff4f6a] mb-4">{error}</p>}

        {/* SAMPLE BUTTONS */}
        <div className="flex gap-3 mb-8">
          <button onClick={loadSample} className="font-mono text-xs text-[#6b7280] border border-white/10 px-4 py-2 rounded-lg hover:border-white/20 hover:text-[#e8eaf0] transition-all">
            Load sample data
          </button>
          <button onClick={downloadSample} className="font-mono text-xs text-[#6b7280] border border-white/10 px-4 py-2 rounded-lg hover:border-white/20 hover:text-[#e8eaf0] transition-all">
            Download sample CSV ↓
          </button>
        </div>

        {/* PREVIEW TABLE */}
        {rows.length > 0 && (
          <div className="border border-white/[0.07] rounded-xl overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-white/[0.07] bg-[#111318]">
              <span className="font-mono text-[10px] tracking-widest text-[#6b7280] uppercase">Preview — {rows.length} rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {['ID', 'Date', 'Description', 'Amount'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[#6b7280] font-normal tracking-wider text-[10px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-[#4f9eff]">{row.id}</td>
                      <td className="px-4 py-2.5 text-[#6b7280]">{row.date}</td>
                      <td className="px-4 py-2.5 text-[#e8eaf0]">{row.description}</td>
                      <td className="px-4 py-2.5 text-[#00e5a0]">${parseFloat(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {rows.length > 5 && (
                    <tr><td colSpan={4} className="px-4 py-2.5 text-[#6b7280] text-center">+{rows.length - 5} more rows</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={runReconciliation}
          disabled={!rows.length}
          className={`w-full py-4 rounded-xl font-mono text-sm font-medium transition-all ${
            rows.length
              ? 'bg-[#00e5a0] text-black hover:opacity-90'
              : 'bg-[#111318] text-[#6b7280] border border-white/[0.07] cursor-not-allowed'
          }`}
        >
          {rows.length ? `Run Reconciliation on ${rows.length} transactions →` : 'Upload a CSV to continue'}
        </button>
      </div>
    </main>
  )
}
