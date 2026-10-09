import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Zap, Sparkles } from 'lucide-react'

// ── Gemini setup ──────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

const SYSTEM_PROMPT = `You are the CAMPUS-SYNC Assistant — a helpful, friendly AI embedded inside a college OD (On-Duty) management web application called Campus-Approve (also known as CAMPUS-SYNC).

Your job is to help students, advisors, HODs, faculty, and admins understand how to use the platform.

Key facts about the platform:
- Students apply for OD (On-Duty) leave for events like hackathons, symposiums, workshops, sports, and paper presentations
- Approval chain: Student submits → Class Advisor approves → HOD gives final approval → Faculty are auto-notified
- After the event, students must upload a participation certificate (proof)
- OD Stages: submitted → advisor_review → hod_review → approved → proof_pending → verified / rejected
- Urgent ODs (event within 3 days) are auto-flagged and go to the top of the approval queue
- Team OD: multiple students can be added to one OD request
- Team Finder: students can post and browse hackathon team listings with skill tags
- Events Board: students can browse upcoming college events
- 5 roles: student, advisor, hod, faculty, admin
- Built with React, TypeScript, Firebase (Auth + Firestore + Storage), Tailwind CSS, Framer Motion

Be concise, warm, and helpful. Use emojis sparingly. If a question is unrelated to the platform or college, politely redirect.
Answer in the same language the user writes in.`

async function askGemini(_history: { role: string; text: string }[], userMessage: string): Promise<string> {
  // Use REST API directly to avoid any SDK/CORS issues
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Gemini API error:', res.status, errText)
    throw new Error(`Gemini ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not generate a response.'
}

// ── Fallback KB (if no API key) ───────────────────────────────
interface QA { patterns: string[]; answer: string }
const KB: QA[] = [
  { patterns: ['what is od','on duty','on-duty'], answer: '📋 **On-Duty (OD)** lets students attend external events without being marked absent. Attendance is counted as present.' },
  { patterns: ['how to apply','apply for od','submit od','new od'], answer: '🚀 Click **"Apply for OD"** in the sidebar, fill in the event details and periods, then submit. Your Advisor gets notified instantly!' },
  { patterns: ['who approves','approval process','approval chain'], answer: '✅ **Class Advisor** approves first → **HOD** gives final approval → Faculty are auto-notified.' },
  { patterns: ['urgent','urgent od'], answer: '⚡ ODs starting within 3 days are auto-flagged **Urgent** and jump to the top of the approver queue.' },
  { patterns: ['team od','group od'], answer: '👥 Toggle **Team OD** on the form to add teammates by roll number. One submission covers the whole team.' },
  { patterns: ['proof','certificate','upload proof'], answer: '📎 After the event, go to **My ODs**, open the approved OD, and upload your participation certificate within 7 days.' },
  { patterns: ['status','track od','my od'], answer: '🔍 Check **My ODs** in the sidebar. Each card shows the current stage: Submitted → Advisor → HOD → Approved → Proof → Verified.' },
  { patterns: ['faculty','teacher notif'], answer: '📣 When the HOD approves, the system auto-notifies all faculty who teach during your OD periods.' },
  { patterns: ['team finder','find team'], answer: '🤝 **Team Finder** is a board where students post and browse hackathon team listings with skill tags.' },
  { patterns: ['hi','hello','hey'], answer: '👋 Hi! I\'m the CAMPUS-SYNC Assistant. Ask me about OD applications, approvals, proof upload, or Team Finder!' },
  { patterns: ['thank','thanks'], answer: '😊 You\'re welcome! Good luck with your event! 🎉' },
]

function getFallbackResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const qa of KB) {
    if (qa.patterns.some(p => lower.includes(p))) return qa.answer
  }
  return `🤔 I'm not sure about that. Try asking about:\n- How to apply for OD\n- Approval process\n- Proof upload\n- Team Finder\n\nOr contact your Class Advisor for help!`
}

// ── Types ─────────────────────────────────────────────────────
interface Msg { id: number; role: 'user' | 'bot'; text: string; time: Date }

const QUICK = ['How do I apply for OD?', 'Who approves my OD?', 'What is a Team OD?', 'How to upload proof?']

function formatText(text: string) {
  return text.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j} style={{ fontWeight: 800, color: '#172033' }}>{part.slice(2, -2)}</strong>
          : part
      )}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ))
}

// ── Component ─────────────────────────────────────────────────
export default function ChatBot() {
  const [open,   setOpen]   = useState(false)
  const [input,  setInput]  = useState('')
  const [msgs,   setMsgs]   = useState<Msg[]>([
    { id: 0, role: 'bot', text: `👋 Hi! I'm the CAMPUS-SYNC Assistant${GEMINI_API_KEY ? ' — powered by Gemini AI ✨' : ''}.\nAsk me anything about OD applications, approvals, or the platform!`, time: new Date() }
  ])
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<{ role: string; text: string }[]>([])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, open])

  const send = async (text: string) => {
    if (!text.trim() || typing) return
    const userMsg: Msg = { id: Date.now(), role: 'user', text: text.trim(), time: new Date() }
    setMsgs(p => [...p, userMsg])
    setInput('')
    setTyping(true)

    historyRef.current = [...historyRef.current, { role: 'user', text: text.trim() }]

    try {
      let reply: string
      if (GEMINI_API_KEY) {
        reply = await askGemini(historyRef.current, text.trim())
      } else {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
        reply = getFallbackResponse(text)
      }
      historyRef.current = [...historyRef.current, { role: 'bot', text: reply }]
      setTyping(false)
      setMsgs(p => [...p, { id: Date.now() + 1, role: 'bot', text: reply, time: new Date() }])
    } catch (err) {
      setTyping(false)
      const errMsg = `⚠️ Couldn't reach the AI right now. ${getFallbackResponse(text)}`
      setMsgs(p => [...p, { id: Date.now() + 1, role: 'bot', text: errMsg, time: new Date() }])
    }
  }

  const fmtTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        style={{ position: 'fixed', bottom: 28, right: 28, width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg,#172033,#D66A3D)', border: 'none', cursor: 'pointer', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          boxShadow: '0 8px 32px rgba(214,106,61,0.35), 0 2px 8px rgba(0,0,0,0.15)',
        }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X style={{ width: 22, height: 22 }} /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><MessageCircle style={{ width: 22, height: 22 }} /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Unread dot */}
      {!open && (
        <div style={{ position: 'fixed', bottom: 76, right: 26, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', border: '2px solid white', zIndex: 1000 }} />
      )}

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            style={{ position: 'fixed', bottom: 96, right: 24, width: 360, height: 540, zIndex: 998,
              background: 'white', borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(214,106,61,0.35), 0 8px 24px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
            }}>

            {/* Header */}
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,#172033,#D66A3D)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>CAMPUS-SYNC Assistant</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Online · Always available
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {GEMINI_API_KEY
                  ? <><Sparkles style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.8)' }} /><span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700 }}>Gemini</span></>
                  : <><Zap      style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.6)' }} /><span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700 }}>AI</span></>
                }
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {msgs.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'bot' ? 'linear-gradient(135deg,#172033,#D66A3D)' : 'linear-gradient(135deg,#64748b,#475569)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
                    {msg.role === 'bot' ? <Bot style={{ width: 14, height: 14, color: 'white' }} /> : <User style={{ width: 14, height: 14, color: 'white' }} />}
                  </div>
                  <div style={{ maxWidth: '78%' }}>
                    <div style={{ padding: '10px 14px', borderRadius: msg.role === 'bot' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      background: msg.role === 'bot' ? '#F7F5F2' : 'linear-gradient(135deg,#172033,#D66A3D)',
                      color: msg.role === 'bot' ? '#334155' : 'white',
                      fontSize: 13, lineHeight: 1.55, fontWeight: 500,
                      border: msg.role === 'bot' ? '1px solid #e2e8f0' : 'none',
                      boxShadow: msg.role === 'user' ? '0 4px 12px rgba(214,106,61,0.35)' : '0 2px 6px rgba(0,0,0,0.05)',
                    }}>
                      {formatText(msg.text)}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left', fontWeight: 600 }}>
                      {fmtTime(msg.time)}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#172033,#D66A3D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot style={{ width: 14, height: 14, color: 'white' }} />
                  </div>
                  <div style={{ padding: '10px 16px', borderRadius: '4px 16px 16px 16px', background: '#F7F5F2', border: '1px solid #e2e8f0', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8' }}
                        animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay, ease: 'easeInOut' }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {msgs.length <= 2 && (
              <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK.map(q => (
                  <button key={q} onClick={() => send(q)}
                    style={{ padding: '5px 12px', fontSize: 11, fontWeight: 700, borderRadius: 20, cursor: 'pointer',
                      background: 'rgba(214,106,61,0.07)', color: '#D66A3D', border: '1px solid rgba(214,106,61,0.25)', transition: 'all 0.15s' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '10px 12px 14px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, flexShrink: 0 }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }}}
                placeholder={GEMINI_API_KEY ? 'Ask Gemini anything…' : 'Ask me anything…'}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 14, border: '1.5px solid #e2e8f0', outline: 'none',
                  fontSize: 13, fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#172033', background: '#F7F5F2',
                  transition: 'border-color 0.15s' }}
                onFocus={e => e.currentTarget.style.borderColor = '#D66A3D'}
                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
              <motion.button onClick={() => send(input)} whileTap={{ scale: 0.92 }} disabled={!input.trim() || typing}
                style={{ width: 40, height: 40, borderRadius: 12, border: 'none', cursor: (input.trim() && !typing) ? 'pointer' : 'not-allowed',
                  background: (input.trim() && !typing) ? 'linear-gradient(135deg,#172033,#D66A3D)' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: (input.trim() && !typing) ? '0 4px 12px rgba(214,106,61,0.35)' : 'none', transition: 'all 0.15s' }}>
                <Send style={{ width: 16, height: 16, color: (input.trim() && !typing) ? 'white' : '#94a3b8' }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
