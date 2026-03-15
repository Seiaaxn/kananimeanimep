import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import { NotificationChecker } from '@/components/notification-checker'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans'
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
});

export const metadata: Metadata = {
  title: 'KANANIMEID - Streaming Anime Subtitle Indonesia',
  description: 'Nonton anime subtitle Indonesia terlengkap dan terbaru. Streaming anime gratis dengan kualitas HD.',
  keywords: ['anime', 'streaming', 'subtitle indonesia', 'nonton anime', 'anime sub indo'],
  authors: [{ name: 'KANANIMEID' }],
  icons: {
    icon: '/logo-icon.jpg',
    apple: '/logo-icon.jpg',
  },
  openGraph: {
    title: 'KANANIMEID - Streaming Anime Subtitle Indonesia',
    description: 'Nonton anime subtitle Indonesia terlengkap dan terbaru',
    type: 'website',
    images: ['/logo-icon.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#dc2626',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-icon.jpg" />
        <link rel="apple-touch-icon" href="/logo-icon.jpg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        <AuthProvider>
          <NotificationChecker />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
