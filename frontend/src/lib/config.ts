export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  },
  externalLinks: {
    mbtiTest: process.env.NEXT_PUBLIC_MBTI_URL ?? 'https://www.16personalities.com/',
    hdChart:  process.env.NEXT_PUBLIC_HD_URL   ?? 'https://www.jovianarchive.com/get_your_chart',
  },
  app: {
    name:    'Character Career Blueprint',
    tagline: 'Discover Your Career Path Through the Lens of Who You Truly Are',
  },
} as const
