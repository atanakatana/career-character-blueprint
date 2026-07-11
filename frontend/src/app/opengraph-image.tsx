import { ImageResponse } from 'next/og'

export const alt         = 'Character Career Blueprint'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GOLD  = '#F5C542'
const BLUE  = '#4DA6FF'
const BG    = '#10141F'
const PANEL = '#1A2035'
const MUTED = '#6B7280'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width:           '100%',
        height:          '100%',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        background:      BG,
        position:        'relative',
        fontFamily:      'monospace',
        padding:         '60px',
        border:          `6px solid ${GOLD}`,
      }}
    >
      {/* Corner decorations */}
      {[
        { top: 28, left: 28  },
        { top: 28, right: 28 },
        { bottom: 28, left: 28  },
        { bottom: 28, right: 28 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width:    32,
            height:   32,
            border:   `4px solid ${GOLD}`,
            display:  'flex',
            ...pos,
          }}
        />
      ))}

      {/* Top label */}
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           12,
          marginBottom:  32,
          background:    PANEL,
          border:        `2px solid ${GOLD}`,
          padding:       '10px 28px',
        }}
      >
        <span style={{ color: GOLD, fontSize: 18, fontWeight: 900 }}>◆</span>
        <span style={{ color: GOLD, fontSize: 18, fontWeight: 900, letterSpacing: 4 }}>
          CHARACTER CAREER BLUEPRINT
        </span>
        <span style={{ color: GOLD, fontSize: 18, fontWeight: 900 }}>◆</span>
      </div>

      {/* Main headline */}
      <div
        style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          textAlign:     'center',
          gap:           16,
          marginBottom:  40,
        }}
      >
        <span
          style={{
            color:      '#FFFFFF',
            fontSize:   72,
            fontWeight: 900,
            lineHeight: 1.1,
          }}
        >
          Discover Your
        </span>
        <span
          style={{
            color:      GOLD,
            fontSize:   72,
            fontWeight: 900,
            lineHeight: 1.1,
          }}
        >
          Career Identity
        </span>
      </div>

      {/* Tag line */}
      <div
        style={{
          display:    'flex',
          gap:        24,
          alignItems: 'center',
        }}
      >
        {['MBTI', '×', 'Human Design', '×', 'AI Guidance'].map((item, i) => (
          <span
            key={i}
            style={{
              color:      i % 2 === 1 ? MUTED : BLUE,
              fontSize:   item === '×' ? 28 : 24,
              fontWeight: 700,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          position:   'absolute',
          bottom:     48,
          display:    'flex',
          gap:        8,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 48, height: 2, background: GOLD }} />
        <span style={{ color: MUTED, fontSize: 16, letterSpacing: 3 }}>
          CHARACTER CAREER BLUEPRINT
        </span>
        <div style={{ width: 48, height: 2, background: GOLD }} />
      </div>
    </div>,
    { ...size },
  )
}
