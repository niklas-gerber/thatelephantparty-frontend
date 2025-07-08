import type { Metadata } from 'next'
import './../styles/globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'that elephant party - events',
  description: 'Event management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-slim min-h-screen grid grid-rows-[auto_1fr_auto]">
        <Header />
        <main className="pb-[5vw]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}