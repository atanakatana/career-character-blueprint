import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width:          '100%',
        height:         '100%',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#10141F',
        border:         '3px solid #F5C542',
      }}
    >
      <span
        style={{
          color:       '#F5C542',
          fontSize:    10,
          fontWeight:  900,
          fontFamily:  'monospace',
          letterSpacing: '-0.5px',
        }}
      >
        R:L
      </span>
    </div>,
    { ...size },
  )
}
