import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = "https://video-analysis-backend-hm75.onrender.com";

const QUALITY_COLOR = {
  Excellent: '#7dba84',
  Good:      '#6ba3be',
  Average:   '#d4956a',
  Poor:      '#c96b6b',
}

// ── Small reusable components ────────────────────────────────
function MetricCard({ label, value, unit = '', color = 'var(--text)', icon = '' }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 3, padding: '16px 18px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7, fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color }}>
        {value}
        <span style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 400, color: 'var(--text3)', marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  )
}

function ScoreBar({ label, value, max = 1, color = 'var(--accent2)' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{Math.round(pct)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function TimelineEntry({ item, index }) {
  const isVoice = item.type === 'voice'
  return (
    <div
      className="fade-in"
      style={{
        display: 'flex', gap: 14, padding: '12px 0',
        borderBottom: '1px solid var(--border)',
        animationDelay: `${index * 0.04}s`,
      }}
    >
      <div style={{
        minWidth: 44, padding: '3px 8px', borderRadius: 2,
        background: isVoice ? 'rgba(107,163,190,0.15)' : 'rgba(232,213,163,0.08)',
        color: isVoice ? '#6ba3be' : 'var(--accent2)',
        fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
        textAlign: 'center', alignSelf: 'flex-start', whiteSpace: 'nowrap',
      }}>
        {item.time}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, flex: 1 }}>
        {item.desc}
      </div>
    </div>
  )
}

// ── Genre + Specific category breadcrumb ─────────────────────
function ContentBreadcrumb({ contentType }) {
  if (!contentType) return null
  const { genre, genre_icon, label, icon } = contentType
  const isSame = genre === label || genre === 'General'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {/* Genre pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(232,213,163,0.1)', border: '1px solid rgba(232,213,163,0.25)',
        borderRadius: 2, padding: '5px 14px',
      }}>
        <span style={{ fontSize: 14 }}>{genre_icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent2)', letterSpacing: '0.05em' }}>
          {genre}
        </span>
      </div>

      {/* Arrow */}
      {!isSame && (
        <>
          <span style={{ color: 'var(--text3)', fontSize: 14 }}>›</span>
          {/* Specific type pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(232,213,163,0.18)', border: '1px solid rgba(232,213,163,0.4)',
            borderRadius: 2, padding: '5px 14px',
          }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>
              {label}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Audio / FFT status badge ──────────────────────────────────
function AudioBadge({ audio, transcript }) {
  if (!audio) return null
  const hasSpeech = audio.has_speech
  const method    = audio.detection_method || 'unknown'
  const conf      = Math.round((audio.speech_confidence || 0) * 100)

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: hasSpeech ? 'rgba(107,163,190,0.1)' : 'rgba(201,107,107,0.08)',
      border: `1px solid ${hasSpeech ? 'rgba(107,163,190,0.25)' : 'rgba(201,107,107,0.2)'}`,
      borderRadius: 2, padding: '5px 12px',
    }}>
      <span style={{ fontSize: 12 }}>{hasSpeech ? '🎤' : '🔇'}</span>
      <span style={{ fontSize: 11, color: hasSpeech ? '#6ba3be' : '#c96b6b', fontWeight: 600 }}>
        {hasSpeech
          ? `Voice detected · ${conf}% confidence`
          : 'No speech detected'}
      </span>
      <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
        [{method.toUpperCase()}]
      </span>
    </div>
  )
}

// ── Main Upload component ─────────────────────────────────────
export default function Upload() {
  const navigate = useNavigate()
  const fileRef  = useRef(null)
  const dropRef  = useRef(null)

  const [user, setUser]                   = useState(null)
  const [dragOver, setDragOver]           = useState(false)
  const [file, setFile]                   = useState(null)
  const [title, setTitle]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [loadingStep, setLoadingStep]     = useState('')
  const [progress, setProgress]           = useState(0)
  const [result, setResult]               = useState(null)
  const [error, setError]                 = useState('')
  const [activeTab, setActiveTab]         = useState('timeline')
  const [backendOnline, setBackendOnline] = useState(null)
  const [videoPreview, setVideoPreview]   = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('va_user')
    if (!u) { navigate('/login'); return }
    setUser(JSON.parse(u))
    axios.get(`${API}/api/health`)
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false))
  }, [])

  const pickFile = (f) => {
    if (!f) return
    if (!f.type.startsWith('video/')) {
      setError('Please upload a video file — mp4, mov, avi, mkv, or webm.')
      return
    }
    setFile(f)
    setError('')
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
    setVideoPreview(URL.createObjectURL(f))
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    pickFile(e.dataTransfer.files[0])
  }, [title])

  const STEPS = [
    'Reading video frames…',
    'Running OpenCV analysis…',
    'Detecting scene changes…',
    'Extracting audio track…',
    'Running FFT speech detection…',
    'Running Whisper transcription…',
    'Analysing audio quality…',
    'Detecting content type…',
    'Scoring with AI model…',
    'Building scene timeline…',
    'Finalising results…',
  ]

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(0)

    let stepIdx = 0
    const stepInterval = setInterval(() => {
      setLoadingStep(STEPS[stepIdx % STEPS.length])
      stepIdx++
      setProgress(Math.min(stepIdx * 9, 88))
    }, 1800)

    try {
      const form = new FormData()
      form.append('file', file)
      if (title) form.append('title', title)

      const res = await axios.post(`${API}/api/analyze`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 360000,
      })

      clearInterval(stepInterval)
      setProgress(100)
      setLoadingStep('Complete!')
      await new Promise(r => setTimeout(r, 500))
      setResult(res.data)
      setActiveTab('timeline')
    } catch (err) {
      clearInterval(stepInterval)
      const msg = err.response?.data?.detail || err.message || ''
      if (!backendOnline || msg.toLowerCase().includes('network') || err.code === 'ERR_NETWORK') {
        setError('Backend is offline. Open a terminal and run:\n\ncd backend\nuvicorn main:app --reload --port 8000')
      } else {
        setError(msg || 'Analysis failed. Please try again.')
      }
    }
    setLoading(false)
  }

  const reset = () => {
    setFile(null)
    setTitle('')
    setResult(null)
    setError('')
    setProgress(0)
    setVideoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Transcript status helpers ─────────────────────────────
  const transcriptStatus = result?.transcript?.status
  const transcriptStatusInfo = {
    available: {
      icon: '✅',
      title: null, // rendered inline
      message: null,
    },
    no_speech_detected: {
      icon: '🔇',
      title: 'No Speech Detected',
      message: 'FFT frequency analysis confirmed this video has no human speech — it may be a music-only track, ambient sound, or silent footage.',
    },
    audio_extraction_failed: {
      icon: '🔧',
      title: 'Audio Extraction Failed',
      message: 'ffmpeg could not extract audio from this video file.',
      fix: 'Install ffmpeg: sudo apt-get install ffmpeg   (Linux) or brew install ffmpeg (Mac)',
    },
    whisper_not_installed: {
      icon: '📦',
      title: 'Whisper Not Installed',
      message: 'The Whisper model is not installed on this system.',
      fix: 'pip install openai-whisper',
    },
    transcription_failed: {
      icon: '⚠️',
      title: 'Transcription Failed',
      message: result?.transcript?.error
        ? `Whisper returned an error: ${result?.transcript?.error}`
        : 'Whisper could not process this audio. The file may be corrupted or too short.',
    },
  }

  const TABS = [
    { key: 'timeline',   label: '🎬 Scene Timeline' },
    { key: 'transcript', label: '🎤 Voice Transcript' },
    { key: 'report',     label: '📋 Quality Report' },
    { key: 'emotion',    label: '🧠 Emotion Analysis' },
  ]

  const ct = result?.content_type

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Nav ── */}
      <nav style={{
        padding: '0 36px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13 }}>▶</span>
          </div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            VidAnalyzer
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Backend status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--text2)',
            background: 'var(--bg3)', padding: '6px 14px',
            borderRadius: 2, border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: backendOnline ? '#7dba84' : backendOnline === false ? '#c96b6b' : '#d4956a',
            }} />
            {backendOnline === null ? 'Checking…' : backendOnline ? 'Backend Online' : 'Backend Offline'}
          </div>

          {/* User avatar */}
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg3)', padding: '6px 14px',
              borderRadius: 2, border: '1px solid var(--border)', fontSize: 12,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0c0c0a',
              }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ color: 'var(--text2)' }}>{user.name}</span>
            </div>
          )}

          <button
            onClick={() => { localStorage.removeItem('va_user'); navigate('/login') }}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--sans)' }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>

        {/* ── UPLOAD ZONE (shown only when no result) ── */}
        {!result && (
          <>
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ height: 1, width: 32, background: 'var(--accent2)' }} />
                <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent2)', fontWeight: 600 }}>
                  Video Analysis
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.05 }}>
                Upload Your Video
              </h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 10, lineHeight: 1.7 }}>
                Drop any video — mp4, mov, avi, mkv, webm. AI detects the genre and content type, describes every scene, and transcribes the voice.
              </p>
            </div>

            {/* Drop zone */}
            <div
              ref={dropRef}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !file && fileRef.current?.click()}
              style={{
                border: `1px dashed ${dragOver ? 'var(--accent)' : file ? '#7dba84' : 'var(--border2)'}`,
                borderRadius: 4, padding: file ? '28px' : '68px 40px', textAlign: 'center',
                cursor: file ? 'default' : 'pointer',
                background: dragOver ? 'rgba(232,213,163,0.04)' : file ? 'rgba(125,186,132,0.04)' : 'var(--card)',
                transition: 'all 0.25s', marginBottom: 20, position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Loading overlay */}
              {loading && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(12,12,10,0.9)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10, backdropFilter: 'blur(6px)',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '3px solid rgba(232,213,163,0.15)',
                    borderTop: '3px solid var(--accent)',
                    animation: 'spin 0.85s linear infinite', marginBottom: 22,
                  }} />
                  <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 17, marginBottom: 5 }}>
                    {loadingStep}
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 22 }}>
                    May take 30–90 seconds for a typical video
                  </div>
                  <div style={{ width: 240, height: 3, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: 'var(--accent)', borderRadius: 2,
                      width: `${progress}%`, transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ marginTop: 9, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent2)' }}>
                    {progress}%
                  </div>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.m4v,.3gp,.flv"
                style={{ display: 'none' }}
                onChange={e => pickFile(e.target.files[0])}
              />

              {file ? (
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                  {videoPreview && (
                    <video
                      src={videoPreview}
                      style={{ width: 180, height: 110, objectFit: 'cover', borderRadius: 3, border: '1px solid var(--border)', flexShrink: 0 }}
                      muted
                    />
                  )}
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#7dba84', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                      ✓ File Ready
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 19, color: 'var(--text)', marginBottom: 5 }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); reset() }}
                      style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 2, padding: '5px 14px', color: 'var(--text3)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--sans)' }}
                    >
                      Change file
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 52, marginBottom: 18 }}>🎬</div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                    {dragOver ? 'Drop to upload' : 'Drop your video here'}
                  </h3>
                  <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>
                    mp4 · mov · avi · mkv · webm
                  </p>
                  <div className="btn btn-outline" style={{ display: 'inline-flex', pointerEvents: 'none', fontSize: 11 }}>
                    Browse File
                  </div>
                </div>
              )}
            </div>

            {/* Title + analyze button */}
            {file && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input
                  className="input"
                  placeholder="Video title — helps detect: cricket, dance, gaming, cooking, educational, etc."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={analyze}
                  disabled={loading}
                  style={{ minWidth: 168, justifyContent: 'center', fontSize: 12, padding: '13px 28px' }}
                >
                  {loading
                    ? <><div className="spinner" /> Analysing…</>
                    : 'Analyse Now →'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div style={{
            background: 'rgba(201,107,107,0.07)', border: '1px solid rgba(201,107,107,0.2)',
            borderRadius: 3, padding: '16px 20px', marginBottom: 24,
            color: '#c96b6b', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── RESULTS ── */}
        {result && (
          <div className="fade-up">

            {/* ════════════════════════════════════════════════
                BLOCK 2 — FILE INFO + TAGS ROW
            ════════════════════════════════════════════════ */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Analysis complete for</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 10 }}>
                {result.title || result.filename}
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {result.video_metrics && (
                  <>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 10px', borderRadius: 2, border: '1px solid var(--border)' }}>
                      ⏱ {result.video_metrics.duration_str}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 10px', borderRadius: 2, border: '1px solid var(--border)' }}>
                      📐 {result.video_metrics.resolution}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 10px', borderRadius: 2, border: '1px solid var(--border)' }}>
                      🎞 {result.video_metrics.fps} fps
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 10px', borderRadius: 2, border: '1px solid var(--border)' }}>
                      🎬 {result.video_metrics.scene_changes} scenes
                    </span>
                  </>
                )}
                {/* FFT + transcript status */}
                {result.audio && <AudioBadge audio={result.audio} transcript={result.transcript} />}
              </div>
            </div>

            {/* ════════════════════════════════════════════════
                BLOCK 3 — QUALITY CARD + SCORE BARS
            ════════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, marginBottom: 16 }}>
              {/* Quality rating box */}
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderTop: `3px solid ${QUALITY_COLOR[result.quality?.label] || 'var(--accent2)'}`,
                borderRadius: 4, padding: '28px 24px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 900, lineHeight: 1, color: QUALITY_COLOR[result.quality?.label] || 'var(--accent2)' }}>
                  {result.quality?.label}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', margin: '8px 0 18px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Overall Quality
                </div>
                {result.quality?.overall_score !== undefined && (
                  <>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 900, lineHeight: 1, color: QUALITY_COLOR[result.quality?.label] }}>
                      {Math.round(result.quality.overall_score * 100)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>/ 100</div>
                    <div style={{ fontSize: 20 }}>{result.quality?.emoji}</div>
                  </>
                )}
              </div>

              {/* Score bars */}
              <div className="card">
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 700, marginBottom: 18 }}>
                  Quality Breakdown
                </div>
                {result.video_metrics && (
                  <>
                    <ScoreBar label="Visual Quality"    value={result.video_metrics.visual_quality_score}               color="var(--accent2)" />
                    <ScoreBar label="Sharpness / Focus" value={Math.min(result.video_metrics.avg_sharpness, 100)} max={100} color="#6ba3be" />
                    <ScoreBar label="Camera Stability"  value={result.video_metrics.stability_score}                    color="#7dba84" />
                    <ScoreBar label="Contrast"          value={result.video_metrics.contrast_score}           max={128} color="#d4956a" />
                    <ScoreBar label="Color Diversity"   value={result.video_metrics.color_diversity}                    color="var(--accent)" />
                  </>
                )}
                <ScoreBar label="Audio Clarity" value={result.audio?.clarity_score || 0} color="#c96b6b" />
              </div>
            </div>

            {/* ════════════════════════════════════════════════
                BLOCK 4 — METRICS GRID
            ════════════════════════════════════════════════ */}
            {result.video_metrics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 20 }}>
                <MetricCard icon="💡" label="Brightness"   value={Math.round(result.video_metrics.avg_brightness)} />
                <MetricCard icon="🔍" label="Sharpness"    value={Math.round(result.video_metrics.avg_sharpness)}  color="#6ba3be" />
                <MetricCard icon="🎞️" label="Frame Rate"   value={result.video_metrics.fps}                       unit="fps" color="var(--accent2)" />
                <MetricCard icon="📸" label="Scenes"       value={result.video_metrics.scene_changes}              color="#d4956a" />
                <MetricCard icon="🎬" label="Motion"       value={result.video_metrics.motion_score?.toFixed(1)}  color="#c96b6b" />
                <MetricCard icon="🗜️" label="Artifacts"    value={`${Math.round(result.video_metrics.compression_artifacts * 100)}%`} color={result.video_metrics.compression_artifacts > 0.4 ? '#c96b6b' : '#7dba84'} />
                {result.audio && (
                  <MetricCard icon="🔊" label="Audio SNR"  value={result.audio.snr_db?.toFixed(1) ?? 'N/A'} unit="dB" color="#6ba3be" />
                )}
                {result.transcript && (
                  <MetricCard icon="📝" label="Words"      value={result.transcript.word_count || 0}             color="var(--accent2)" />
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════
                BLOCK 5 — TABS
            ════════════════════════════════════════════════ */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '11px 26px', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    background: 'transparent',
                    color: activeTab === tab.key ? 'var(--accent)' : 'var(--text3)',
                    borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab panels ── */}
            <div className="card" style={{ minHeight: 260 }}>

              {/* ── SCENE TIMELINE ── */}
              {activeTab === 'timeline' && (
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 17, marginBottom: 5 }}>
                      Scene-by-Scene Timeline
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
                      Scene descriptions are tailored to the detected content type ({ct?.label || 'video'}).
                      🎤 entries show exactly what was spoken, transcribed by Whisper.
                    </p>
                  </div>
                  {result.timeline?.length > 0
                    ? result.timeline.map((item, i) => <TimelineEntry key={i} item={item} index={i} />)
                    : (
                      <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text3)' }}>
                        No timeline data — video may be too short or couldn't be processed
                      </div>
                    )
                  }
                </div>
              )}

              {/* ── VOICE TRANSCRIPT ── */}
              {activeTab === 'transcript' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 17, marginBottom: 5 }}>
                        Voice Transcription
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                        OpenAI Whisper + FFT speech detection · Runs 100% locally · No internet required
                      </p>
                    </div>

                    {/* Language badge */}
                    {result.transcript?.available && result.transcript?.language && (
                      <div style={{
                        fontSize: 11, background: 'rgba(107,163,190,0.1)', color: '#6ba3be',
                        border: '1px solid rgba(107,163,190,0.25)', padding: '4px 12px',
                        borderRadius: 2, fontWeight: 700, letterSpacing: '0.08em',
                        flexShrink: 0, textTransform: 'uppercase',
                      }}>
                        {result.transcript.language?.toUpperCase()}
                        {result.transcript.model_used && (
                          <span style={{ marginLeft: 6, color: 'var(--text3)', fontWeight: 400 }}>
                            ({result.transcript.model_used})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FFT speech info bar */}
                  {result.audio && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                      background: 'var(--bg3)', borderRadius: 3, padding: '12px 16px',
                      border: '1px solid var(--border)', marginBottom: 20, fontSize: 12,
                    }}>
                      <div>
                        <span style={{ color: 'var(--text3)' }}>FFT Detection: </span>
                        <span style={{ fontWeight: 700, color: result.audio.has_speech ? '#7dba84' : '#c96b6b' }}>
                          {result.audio.has_speech ? 'Speech Present' : 'No Speech'}
                        </span>
                      </div>
                      {result.audio.fft_snr > 0 && (
                        <div>
                          <span style={{ color: 'var(--text3)' }}>SNR (300–3400Hz): </span>
                          <span style={{ fontWeight: 700, color: 'var(--accent2)', fontFamily: 'var(--mono)' }}>
                            {result.audio.fft_snr?.toFixed(3)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span style={{ color: 'var(--text3)' }}>Confidence: </span>
                        <span style={{ fontWeight: 700, color: 'var(--accent2)', fontFamily: 'var(--mono)' }}>
                          {Math.round((result.audio.speech_confidence || 0) * 100)}%
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text3)' }}>Method: </span>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
                          {result.audio.detection_method?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Show transcript if available ── */}
                  {result.transcript?.available && result.transcript?.full_text ? (
                    <>
                      {/* Full text block */}
                      <div style={{
                        background: 'var(--bg3)', borderRadius: 3, padding: '20px 22px',
                        marginBottom: 22, border: '1px solid var(--border)',
                        borderLeft: '3px solid var(--accent2)',
                      }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>
                          Full Transcript
                        </div>
                        <p style={{ lineHeight: 1.85, fontSize: 14, color: 'var(--text2)', fontStyle: 'italic', margin: 0 }}>
                          "{result.transcript.full_text}"
                        </p>
                        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)' }}>
                          {result.transcript.word_count} words · {result.transcript.segments?.length || 0} segments
                        </div>
                      </div>

                      {/* Timestamped segments */}
                      {result.transcript.segments?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 12 }}>
                            Timestamped Segments
                          </div>
                          {result.transcript.segments.map((seg, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                              <span style={{
                                color: 'var(--accent2)', fontFamily: 'var(--mono)',
                                fontSize: 11, minWidth: 48, paddingTop: 2, flexShrink: 0,
                              }}>
                                {seg.start_str}
                              </span>
                              <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, flex: 1 }}>
                                {seg.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* ── No transcript — clear, helpful message ── */
                    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>
                        {transcriptStatusInfo[transcriptStatus]?.icon || '🔇'}
                      </div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
                        {transcriptStatusInfo[transcriptStatus]?.title || 'Transcript Not Available'}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: 13, lineHeight: 1.75, maxWidth: 440, margin: '0 auto 16px' }}>
                        {transcriptStatusInfo[transcriptStatus]?.message || 'Could not generate a transcript for this video.'}
                      </div>
                      {transcriptStatusInfo[transcriptStatus]?.fix && (
                        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3, padding: '10px 18px', display: 'inline-block', fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
                          {transcriptStatusInfo[transcriptStatus].fix}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── QUALITY REPORT ── */}
              {activeTab === 'report' && (
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, marginBottom: 5, fontSize: 17 }}>
                    Quality Analysis Report
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>
                    Breakdown of strengths and issues across 15+ visual and audio metrics
                  </p>

                  {result.report?.strengths?.length > 0 && (
                    <div style={{ marginBottom: 22 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#7dba84', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Strengths
                      </div>
                      {result.report.strengths.map((s, i) => (
                        <div key={i} style={{
                          padding: '11px 15px', background: 'rgba(125,186,132,0.06)',
                          border: '1px solid rgba(125,186,132,0.15)', borderRadius: 3,
                          marginBottom: 7, fontSize: 13, color: 'var(--text2)',
                        }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.report?.issues?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#c96b6b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Issues Detected
                      </div>
                      {result.report.issues.map((s, i) => (
                        <div key={i} style={{
                          padding: '11px 15px', background: 'rgba(201,107,107,0.06)',
                          border: '1px solid rgba(201,107,107,0.15)', borderRadius: 3,
                          marginBottom: 7, fontSize: 13, color: 'var(--text2)',
                        }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {!result.report?.strengths?.length && !result.report?.issues?.length && (
                    <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text3)' }}>
                      No report data available
                    </div>
                  )}
                </div>
              )}
            </div>


              {/* ── EMOTION ANALYSIS ── */}
              {activeTab === 'emotion' && (() => {
                const em = result?.emotion
                if (!em) return (
                  <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text3)' }}>
                    No emotion data available
                  </div>
                )
                const isPos  = em.polarity === 'Positive'
                const pct    = Math.round((em.positive_prob ?? 0.5) * 100)
                const conf   = Math.round((em.confidence ?? 0) * 100)
                const color  = isPos ? '#7dba84' : '#c96b6b'
                const bgCol  = isPos ? 'rgba(125,186,132,0.08)' : 'rgba(201,107,107,0.08)'
                const border = isPos ? 'rgba(125,186,132,0.25)' : 'rgba(201,107,107,0.25)'

                return (
                  <div>
                    <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, marginBottom: 5, fontSize: 17 }}>
                      Emotion Analysis
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>
                      Multi-modal CNN visual + RNN temporal + FFT audio fusion
                    </p>

                    {/* Big polarity pill */}
                    <div style={{
                      background: bgCol, border: `1px solid ${border}`,
                      borderRadius: 4, padding: '28px 24px', marginBottom: 22,
                      display: 'flex', alignItems: 'center', gap: 20,
                    }}>
                      <div style={{ fontSize: 52 }}>{isPos ? '😊' : '😟'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800, color, letterSpacing: '-1px' }}>
                          {em.polarity}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                          {pct}% positive probability · {conf}% model confidence
                        </div>
                      </div>
                      {/* Confidence arc */}
                      <div style={{ textAlign: 'center', minWidth: 80 }}>
                        <div style={{
                          width: 72, height: 72, borderRadius: '50%',
                          background: `conic-gradient(${color} ${conf * 3.6}deg, var(--bg3) 0deg)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{
                            width: 54, height: 54, borderRadius: '50%',
                            background: 'var(--bg2)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color,
                          }}>
                            {conf}%
                          </div>
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Confidence
                        </div>
                      </div>
                    </div>

                    {/* Model branch scores */}
                    <div style={{ marginBottom: 22 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Model Branch Scores
                      </div>
                      {[
                        { label: 'CNN Visual Score',   val: (em.cnn_score + 1) / 2, desc: 'Frame-level colour, brightness & saturation analysis' },
                        { label: 'RNN Temporal Score', val: (em.rnn_score + 1) / 2, desc: 'Sequential dynamics across video timeline' },
                        { label: 'FFT Audio Score',    val: (em.fft_score + 1) / 2, desc: 'Spectral pitch, energy & tempo analysis' },
                      ].map(({ label, val, desc }) => {
                        const p = Math.max(0, Math.min(1, val ?? 0.5))
                        const c = p >= 0.5 ? '#7dba84' : '#c96b6b'
                        return (
                          <div key={label} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>
                                {Math.round(p * 100)}%
                              </span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${p * 100}%`, background: c }} />
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{desc}</div>
                          </div>
                        )
                      })}
                    </div>

                    {/* FFT details */}
                    {em.fft_details && !em.fft_details.error && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          FFT Audio Details
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
                          {[
                            { k: 'spectral_centroid', label: 'Spectral Centroid', unit: 'Hz' },
                            { k: 'rms_energy',        label: 'RMS Energy',        unit: '' },
                            { k: 'tempo_bpm',         label: 'Est. Tempo',        unit: 'BPM' },
                            { k: 'high_energy',       label: 'High-Freq Energy',  unit: '' },
                          ].map(({ k, label, unit }) => em.fft_details[k] != null && (
                            <div key={k} style={{
                              background: 'var(--bg3)', borderRadius: 3, padding: '12px 14px',
                              border: '1px solid var(--border)',
                            }}>
                              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{label}</div>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: 'var(--accent2)' }}>
                                {typeof em.fft_details[k] === 'number' ? em.fft_details[k].toFixed(k === 'spectral_centroid' ? 0 : k === 'tempo_bpm' ? 1 : 4) : em.fft_details[k]}
                                {unit && <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 3, color: 'var(--text3)' }}>{unit}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emotion timeline */}
                    {em.timeline?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Emotion Timeline
                        </div>
                        {em.timeline.map((seg, i) => {
                          const sp = Math.round(seg.positive * 100)
                          const sc = seg.label === 'Positive' ? '#7dba84' : '#c96b6b'
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 14,
                              padding: '9px 0', borderBottom: '1px solid var(--border)',
                            }}>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent2)', minWidth: 40 }}>{seg.time}</span>
                              <div style={{ flex: 1 }}>
                                <div className="progress-bar" style={{ marginBottom: 0 }}>
                                  <div className="progress-fill" style={{ width: `${sp}%`, background: sc }} />
                                </div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: sc, minWidth: 64, textAlign: 'right' }}>
                                {seg.label} {sp}%
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Meta */}
                    <div style={{ marginTop: 20, fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', textAlign: 'right' }}>
                      {em.model} · {em.frames_analysed} frames analysed
                    </div>
                  </div>
                )
              })()}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
              <button onClick={reset} className="btn btn-outline" style={{ fontSize: 11 }}>
                ↩ Analyse Another
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(blob)
                  a.download = `analysis_${Date.now()}.json`
                  a.click()
                }}
                className="btn btn-ghost"
                style={{ fontSize: 11 }}
              >
                Export JSON
              </button>
            </div>
          </div>
        )}

        {/* ── Info cards shown when nothing is uploaded ── */}
        {!result && !file && (
          <div style={{
            marginTop: 10,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: 1, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden',
          }}>
            {[
              { icon: '🏏', title: 'Genre Detection',     desc: 'Detects genre (Sports, Education, Entertainment) and specific type (Cricket, Hip-Hop Dance, FPS Gaming)' },
              { icon: '🔊', title: 'FFT Speech Analysis', desc: 'Fast Fourier Transform analyses the 300–3400 Hz speech band to confirm if the video has voice before Whisper runs' },
              { icon: '🎤', title: 'Voice Transcription', desc: 'Whisper AI transcribes every spoken word with precise timestamps — runs offline, no API key needed' },
              { icon: '⭐', title: 'Quality Scoring',     desc: 'Random Forest model rates across 15+ metrics: Excellent, Good, Average, or Poor' },
            ].map((f, i) => (
              <div
                key={f.title}
                style={{
                  textAlign: 'center', padding: '28px 20px',
                  background: 'var(--card)',
                  borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ fontSize: 34, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
