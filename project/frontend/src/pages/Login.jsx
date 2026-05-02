import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  const DEMO = { email: 'demo@vidanalyzer.ai', password: 'demo123' }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    if (mode === 'login') {
      if (form.email === DEMO.email && form.password === DEMO.password) {
        localStorage.setItem('va_user', JSON.stringify({ name: 'Demo User', email: DEMO.email }))
        navigate('/upload')
      } else if (form.email && form.password.length >= 6) {
        localStorage.setItem('va_user', JSON.stringify({ name: form.email.split('@')[0], email: form.email }))
        navigate('/upload')
      } else {
        setError('Invalid credentials. Use demo@vidanalyzer.ai / demo123 or any email with 6+ char password.')
      }
    } else {
      if (!form.name || !form.email || form.password.length < 6) {
        setError('Fill all fields. Password must be at least 6 characters.')
      } else {
        localStorage.setItem('va_user', JSON.stringify({ name: form.name, email: form.email }))
        navigate('/upload')
      }
    }
    setLoading(false)
  }

  const fillDemo = () => setForm(f => ({ ...f, email: DEMO.email, password: DEMO.password }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* Left panel */}
      <div style={{
        flex: '0 0 52%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 72px', position: 'relative', overflow: 'hidden',
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,213,163,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 72 }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14 }}>▶</span>
          </div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>VidAnalyzer</span>
        </Link>

        <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent2)', fontWeight: 600, marginBottom: 20 }}>AI Video Analysis</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,3.5vw,52px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-1.5px', marginBottom: 20 }}>
          Analyze. Understand.<br />
          <em style={{ fontStyle: 'italic', color: 'var(--accent2)' }}>Improve.</em>
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.75, maxWidth: 380, marginBottom: 44 }}>
          Upload any video and get a complete breakdown — content type detection, scene descriptions, voice transcription, and quality rating.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '🏏', text: 'Detects cricket, football, dance, gaming, cooking & more' },
            { icon: '🎤', text: 'Whisper AI transcribes speech with timestamps' },
            { icon: '🔍', text: 'Frame-by-frame OpenCV visual analysis' },
            { icon: '⭐', text: 'AI quality rating across 15+ metrics' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ fontSize: 20, lineHeight: 1.4 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 2, padding: 3, marginBottom: 40, border: '1px solid var(--border)' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '10px 0', borderRadius: 2, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--sans)', letterSpacing: '0.08em', textTransform: 'uppercase',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#0c0c0a' : 'var(--text3)',
                transition: 'all 0.2s',
              }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
            {mode === 'login' ? 'Welcome back' : 'Get started'}
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 36 }}>
            {mode === 'login' ? 'Sign in to access your video analyzer' : 'Create an account to start analyzing videos'}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Full Name</label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div style={{ marginBottom: mode === 'login' ? 8 : 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingRight: 48 }} required />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 24 }}>
                <button type="button" onClick={fillDemo} style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--sans)', fontWeight: 600 }}>
                  Use demo credentials
                </button>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(201,107,107,0.1)', border: '1px solid rgba(201,107,107,0.25)', borderRadius: 3, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 11, padding: '14px', marginBottom: 20 }}>
              {loading ? <><div className="spinner" /> Authenticating...</> : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          {mode === 'login' && (
            <div style={{ background: 'var(--bg3)', borderRadius: 3, padding: '14px 18px', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
              <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>Demo account:</span> demo@vidanalyzer.ai / demo123
            </div>
          )}

          <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, marginTop: 24 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'var(--sans)' }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
