import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const TICKER_ITEMS = [
  '🏏 Cricket Match Analysis', '⚽ Football Match Coverage', '💃 Dance Choreography',
  '🎮 Gaming Highlights', '📚 Educational Facts Videos', '🍳 Cooking & Food Content',
  '💪 Fitness Workouts', '🎵 Music Performances', '✈️ Travel Vlogs',
  '📰 News & Commentary', '💻 Tech Tutorials', '🏀 Basketball Gameplay',
]

const FEATURES = [
  {
    icon: '🎬',
    title: 'Frame-by-Frame Analysis',
    desc: 'OpenCV extracts every scene, measuring brightness, sharpness, motion stability, and compression artifacts at the frame level.',
  },
  {
    icon: '🧠',
    title: 'Content Type Detection',
    desc: 'AI recognises whether your video is cricket, football, dance, gaming, educational facts, cooking, fitness, music, travel, or news.',
  },
  {
    icon: '🎤',
    title: 'Voice Transcription',
    desc: 'OpenAI Whisper transcribes every spoken word with exact timestamps — mapped to the second it was spoken in the video.',
  },
  {
    icon: '⭐',
    title: 'AI Quality Scoring',
    desc: 'Random Forest classifier trained on 15 social media videos rates your content: Excellent, Good, Average, or Poor across 15+ metrics.',
  },
  {
    icon: '📋',
    title: 'Timestamped Description',
    desc: 'Get a second-by-second narration like "0:20 — Batsman plays powerful shot down the ground" merged from scene detection and speech.',
  },
  {
    icon: '🔊',
    title: 'Audio Intelligence',
    desc: 'SNR analysis, RMS energy, spectral centroid, and zero-crossing rate reveal your audio quality beyond just loudness.',
  },
]

const QUALITY_SCALE = [
  { label: 'Excellent', score: 92, color: 'var(--green)',  desc: '4K vlog, 60fps, clear audio, sharp focus, stable camera' },
  { label: 'Good',      score: 74, color: 'var(--blue)',   desc: 'HD footage, 30fps, minimal noise, good lighting' },
  { label: 'Average',   score: 52, color: 'var(--orange)', desc: '720p, slight blur, moderate background noise, shaky cam' },
  { label: 'Poor',      score: 26, color: 'var(--red)',    desc: 'Dark, heavily compressed, muffled audio, very low FPS' },
]

const CONTENT_EXAMPLES = [
  { icon: '🏏', type: 'Cricket',     example: '"Batsman plays powerful shot down the ground"' },
  { icon: '⚽', type: 'Football',    example: '"GOAL — player wheels away in celebration"' },
  { icon: '💃', type: 'Dance',       example: '"Complex footwork sequence in full rhythm"' },
  { icon: '📚', type: 'Educational', example: '"Host presenting a surprising counter-intuitive fact"' },
  { icon: '🍳', type: 'Cooking',     example: '"Food sizzling in the pan — steam rising"' },
  { icon: '🎮', type: 'Gaming',      example: '"Clutch play developing — outnumbered situation"' },
  { icon: '💪', type: 'Fitness',     example: '"Core work — plank position held steady"' },
  { icon: '🎵', type: 'Music',       example: '"Emotional peak of the song — vocals soar"' },
]

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3500)
    return () => clearInterval(iv)
  }, [])

  const tickerDouble = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(12,12,10,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.35s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>▶</span>
          </div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700 }}>VidAnalyzer</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost" style={{ padding: '9px 22px', fontSize: 11 }}>Sign In</Link>
          <Link to="/login" className="btn btn-primary" style={{ padding: '9px 22px', fontSize: 11 }}>Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', position: 'relative' }}>
        {/* Background subtle gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,213,163,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="fade-up" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent2)', fontWeight: 600, border: '1px solid rgba(232,213,163,0.2)', padding: '6px 18px', borderRadius: 2 }}>
            Powered by Whisper · OpenCV · RandomForest
          </span>
        </div>

        <h1 className="fade-up" style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(44px,7vw,92px)',
          fontWeight: 900, lineHeight: 1.02, letterSpacing: '-2px',
          maxWidth: 900, marginBottom: 28,
          animationDelay: '0.1s',
        }}>
          Understand Every<br />
          <em style={{ fontStyle: 'italic', color: 'var(--accent2)' }}>Second of Your Video</em>
        </h1>

        <p className="fade-up" style={{
          fontSize: 18, color: 'var(--text2)', lineHeight: 1.75,
          maxWidth: 560, marginBottom: 44, animationDelay: '0.2s',
        }}>
          Upload any video. AI detects whether it's cricket, dance, gaming, educational facts, cooking, sports or anything else — then describes every scene with timestamps.
        </p>

        <div className="fade-up" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
          <Link to="/login" className="btn btn-primary" style={{ fontSize: 12, padding: '15px 40px' }}>Analyze Your Video →</Link>
          <a href="#features" className="btn btn-outline" style={{ fontSize: 12, padding: '15px 40px' }}>See How It Works</a>
        </div>

        {/* Example output card */}
        <div className="fade-up" style={{
          marginTop: 72, maxWidth: 720, width: '100%',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 4, overflow: 'hidden', textAlign: 'left',
          animationDelay: '0.4s', position: 'relative',
        }}>
          {/* Scan line */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,var(--accent2),transparent)', animation: 'scanline 4s linear infinite', zIndex: 2 }} />

          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', opacity: 0.7 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--orange)', opacity: 0.7 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', opacity: 0.7 }} />
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>analyzing: ipl_highlights.mp4</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3, alignItems: 'center', height: 20 }}>
              {[14,20,12,18,10,16].map((h, i) => (
                <div key={i} className="wave-bar" style={{ height: h, opacity: 0.7 }} />
              ))}
            </div>
          </div>

          {/* Detected type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, borderBottom: '1px solid var(--border)' }}>
            {[
              { label: 'Content Type',   value: '🏏  Cricket Match',       color: 'var(--accent2)' },
              { label: 'Quality Rating', value: '⭐  Excellent',           color: 'var(--green)' },
              { label: 'Voice',          value: '🎤  Transcribed (EN)',    color: 'var(--blue)' },
            ].map(m => (
              <div key={m.label} style={{ padding: '14px 18px', background: 'var(--bg3)' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{m.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: m.color, fontFamily: 'var(--serif)' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(232,213,163,0.03)' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Video Summary</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
              This is a Cricket match video capturing live IPL action. Running for 12 min 34 sec at 1920×1080, the footage features 42 scene transitions — typical of match-day coverage switching between batting, bowling, fielding, and crowd reactions. Overall production quality is rated Excellent.
            </p>
          </div>

          {/* Timeline */}
          <div style={{ padding: '0 20px' }}>
            {[
              { time: '0:00', type: 'scene', desc: 'Match intro — players entering the field' },
              { time: '0:22', type: 'voice', desc: '🎤 "Welcome to tonight\'s IPL clash between Mumbai Indians and CSK..."' },
              { time: '1:10', type: 'scene', desc: 'Opening batsman takes guard at the crease' },
              { time: '2:34', type: 'scene', desc: 'Six hit over long-on — crowd erupts' },
              { time: '3:12', type: 'voice', desc: '🎤 "That\'s a brilliant stroke from the batsman, right out of the middle..."' },
              { time: '4:50', type: 'scene', desc: 'Wicket falls — batsman caught at slip' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                <span style={{
                  minWidth: 40, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, paddingTop: 1,
                  color: item.type === 'voice' ? 'var(--blue)' : 'var(--accent2)',
                }}>{item.time}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0', background: 'var(--bg2)' }}>
        <div className="ticker-inner" style={{ whiteSpace: 'nowrap' }}>
          {tickerDouble.map((item, i) => (
            <span key={i} style={{ fontSize: 12, color: 'var(--text3)', marginRight: 48, letterSpacing: '0.04em' }}>
              {item}
              <span style={{ marginLeft: 48, color: 'var(--border2)' }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CONTENT DETECTION SHOWCASE ── */}
      <section style={{ padding: '100px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, width: 40, background: 'var(--accent2)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent2)', fontWeight: 600 }}>Smart Detection</span>
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.05 }}>
            Knows What Your<br />Video Is About
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.75, maxWidth: 500, marginBottom: 56 }}>
            From cricket match-day coverage to dance choreography, gaming clutch moments to cooking recipes — the AI detects the content type and uses it to describe every scene.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 1, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {CONTENT_EXAMPLES.map((item, i) => (
              <div key={item.type} style={{
                background: 'var(--card)', padding: '24px 22px',
                borderRight: (i + 1) % 4 !== 0 ? '1px solid var(--border)' : 'none',
                borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.2s',
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{item.type}</div>
                <div style={{ fontSize: 12, color: 'var(--accent2)', fontStyle: 'italic', lineHeight: 1.6 }}>{item.example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 24px 100px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, width: 40, background: 'var(--accent2)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent2)', fontWeight: 600 }}>Capabilities</span>
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 56, lineHeight: 1.08 }}>
            Everything Your Video<br />Analysis Needs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card" onClick={() => setActiveFeature(i)} style={{
                cursor: 'pointer',
                borderColor: activeFeature === i ? 'var(--accent2)' : 'var(--border)',
                background: activeFeature === i ? 'var(--card2)' : 'var(--card)',
                transform: activeFeature === i ? 'translateY(-3px)' : 'none',
                transition: 'all 0.25s ease',
              }}>
                <div style={{ fontSize: 34, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, marginBottom: 10, color: activeFeature === i ? 'var(--accent)' : 'var(--text)' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUALITY SCALE ── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, width: 40, background: 'var(--accent2)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent2)', fontWeight: 600 }}>Quality Rating System</span>
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 14, lineHeight: 1.08 }}>
            Four-Level Quality Scale
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 48, lineHeight: 1.7 }}>
            Our AI rates videos across 15+ visual and audio dimensions — brightness, sharpness, motion stability, contrast, compression artifacts, audio clarity, FPS, and more.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {QUALITY_SCALE.map((q) => (
              <div key={q.label} style={{
                display: 'flex', alignItems: 'center', gap: 20,
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '20px 24px', transition: 'border-color 0.2s',
              }}>
                <div style={{ minWidth: 96, fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 18, color: q.color }}>{q.label}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${q.score}%`, background: q.color, borderRadius: 2, transition: 'width 1s ease' }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 15, color: q.color, minWidth: 32 }}>{q.score}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', minWidth: 260, lineHeight: 1.5 }}>{q.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px 100px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, width: 40, background: 'var(--accent2)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent2)', fontWeight: 600 }}>Pipeline</span>
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 52, lineHeight: 1.08 }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { step: '01', title: 'Upload Video',           desc: 'Drop any video file — mp4, mov, avi, mkv, webm — up to any size.' },
              { step: '02', title: 'Frame Extraction',       desc: 'OpenCV reads the video frame by frame, sampling every second.' },
              { step: '03', title: 'Visual Analysis',        desc: 'Brightness, sharpness, contrast, motion, color diversity, and artifacts measured per frame.' },
              { step: '04', title: 'Audio Extraction',       desc: 'ffmpeg extracts the audio track as a clean 16kHz mono WAV file.' },
              { step: '05', title: 'Voice Transcription',    desc: 'Whisper AI transcribes every spoken word with exact start and end timestamps.' },
              { step: '06', title: 'Content Recognition',    desc: 'Title + transcript keywords identify: cricket, dance, gaming, cooking, educational facts, and more.' },
              { step: '07', title: 'Quality Classification', desc: 'Random Forest model predicts Excellent, Good, Average, or Poor across 18 features.' },
              { step: '08', title: 'Timeline Generation',    desc: 'Scene events and voice segments are merged and sorted into a timestamped description.' },
            ].map((item, i) => (
              <div key={item.step} style={{
                display: 'flex', gap: 28, padding: '24px 0',
                borderBottom: i < 7 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', minWidth: 28, paddingTop: 3 }}>{item.step}</span>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 17, marginBottom: 5 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{
            border: '1px solid var(--border2)', borderRadius: 4, padding: '60px 48px',
            background: 'var(--card)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(232,213,163,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 48, marginBottom: 24, lineHeight: 1 }}>▶</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1 }}>
              Ready to analyze your video?
            </h2>
            <p style={{ color: 'var(--text2)', marginBottom: 36, fontSize: 15, lineHeight: 1.75 }}>
              Upload once. Get scene descriptions, voice transcription, content type detection, and quality scoring — all in under 90 seconds.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ fontSize: 12, padding: '15px 48px' }}>
              Start Analyzing Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 16 }}>VidAnalyzer</span>
        <span style={{ color: 'var(--text3)', fontSize: 12 }}>Built with OpenCV · Whisper · FastAPI · React</span>
      </footer>
    </div>
  )
}
