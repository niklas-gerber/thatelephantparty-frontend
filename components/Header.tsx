'use client' // Needed for interactivity

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="relative bg-primary outline outline-2 outline-black">
      <div className="flex items-center justify-between h-[11.5vw] min-h-[80px] px-4">
        {/* Logo - using Next.js optimized Image */}
        <div className="relative w-[14vw] min-w-[100px] max-w-[150px] text-center">
          <Link href="/">
            <Image
              src="/elephantlogo.png" // Place this in public/
              alt="that elephant party logo"
              width={150}
              height={150}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-4 text-[2vw] md:text-[1.2rem]">
            {['EVENTS', 'PODCAST', 'MERCH', 'FUNDRAISER', 'FEATURES', 'CONTACT', 'ABOUT'].map((item) => (
              <li key={item}>
                <Link 
                  href={`/${item.toLowerCase()}`} 
                  className="font-slimbold px-[1vw] py-[0.5vw] hover:outline hover:outline-2 hover:outline-black transition-all"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-black transition-all ${mobileNavOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-black ${mobileNavOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-black transition-all ${mobileNavOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Navigation - will appear below header */}
      {mobileNavOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-primary z-50 outline outline-2 outline-black">
          <MobileNav onClose={() => setMobileNavOpen(false)} />
        </div>
      )}
    </header>
  )
}