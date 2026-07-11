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
  'combining MBTI, Human Design, and career psychology. Get your Career Blueprint delivered to your inbox.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:  'Character Career Blueprint',
    template: '%s | Character Career Blueprint',
  },
  description: DESCRIPTION,
  keywords:    ['career', 'MBTI', 'Human Design', 'AI', 'career blueprint', 'karier', 'kepribadian'],

  openGraph: {
    title:       'Character Career Blueprint',
    description: DESCRIPTION,
    url:         '/',
    siteName:    'Character Career Blueprint',
    type:        'website',
    locale:      'id_ID',
    images: [{
      url:    '/opengraph-image',
      width:  1200,
      height: 630,
      alt:    'Character Career Blueprint — Discover Your Career Identity',
    }],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'Character Career Blueprint',
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
