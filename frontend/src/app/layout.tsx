import type { Metadata } from 'next'
import { Pixelify_Sans, Press_Start_2P, VT323, Inter } from 'next/font/google'
import './globals.css'

// ─── PIXEL FONTS ────────────────────────────────────────────────────────────
const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixelify',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  variable: '--font-press',
  weight: '400',
  display: 'swap',
})

const vt323 = VT323({
  subsets: ['latin'],
  variable: '--font-vt',
  weight: '400',
  display: 'swap',
})

// ─── BODY FONT ──────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// ─── METADATA ───────────────────────────────────────────────────────────────
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost'

const DESCRIPTION =
  'Discover your personalized career path through AI-powered guidance ' +
  'combining MBTI, Human Design, and career psychology. Unlock your Re:Lumma Blueprint.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:  'Re:Lumma',
    template: '%s | Re:Lumma',
  },
  description: DESCRIPTION,
  keywords:    ['career', 'MBTI', 'Human Design', 'AI', 'career blueprint', 'Re:Lumma', 'karier', 'kepribadian'],

  openGraph: {
    title:       'Re:Lumma',
    description: DESCRIPTION,
    url:         '/',
    siteName:    'Re:Lumma',
    type:        'website',
    locale:      'id_ID',
    images: [{
      url:    '/opengraph-image',
      width:  1200,
      height: 630,
      alt:    'Re:Lumma — Discover Your Career Identity',
    }],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'Re:Lumma',
    description: DESCRIPTION,
    images:      ['/opengraph-image'],
  },

  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

// ─── ROOT LAYOUT ────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`
        ${pixelifySans.variable}
        ${pressStart2P.variable}
        ${vt323.variable}
        ${inter.variable}
      `}
    >
      <body className="bg-pixel-bg text-pixel-text font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
