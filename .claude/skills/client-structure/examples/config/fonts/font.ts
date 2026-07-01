import { Inter as FontPrimary } from 'next/font/google'

// font primary
export const fontPrimary = FontPrimary({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
  variable: '--font-primary',
  display: 'swap',
})
