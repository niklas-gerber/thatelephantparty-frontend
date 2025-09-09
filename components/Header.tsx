'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navItems = [
    { name: 'EVENTS', path: '/' },
    { name: 'PODCAST', path: 'https://soundcloud.com/thatelephantparty', external: true },
    { name: 'MERCH', path: '/merch' },
    { name: 'FUNDRAISER', path: '/fundraiser' },
    { name: 'FEATURES', path: '/features' },
    { name: 'CONTACT', path: '/contact' },
    { name: 'ABOUT', path: '/about' },
  ]

  // Get current active page name for mobile display
  const currentPage = navItems.find(item => isActive(item.path))?.name || 'EVENTS'

  return (
    <header className="bg-primary outline outline-2 outline-black relative">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between h-24 px-4">
        <nav className="flex items-center space-x-6">
          {navItems.map((item) => (
            item.external ? (
              <a
                key={item.name}
                href={item.path}
                className="font-slimbold text-lg text-black px-3 py-2 hover:outline hover:outline-2 hover:outline-black transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                href={item.path}
                className={`font-slimbold text-lg text-black px-3 py-2 transition-all ${
                  isActive(item.path)
                    ? 'outline outline-2 outline-black'
                    : 'hover:outline hover:outline-2 hover:outline-black'
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
        </nav>

        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img
              src="/elephantlogo.png"
              alt="that elephant party logo"
              className="h-20 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Navigation - Using grid for perfect centering */}
      <div className="md:hidden grid grid-cols-3 items-center h-16 px-4 relative z-50">
        {/* Logo on left */}
        <div className="flex justify-start">
          <Link href="/">
            <img
              src="/elephantlogo.png"
              alt="that elephant party logo"
              className="h-14 w-auto"
            />
          </Link>
        </div>

        {/* Current page title centered in the middle column */}
        <div className="flex justify-center">
          <div className={`font-slimbold text-lg text-black px-3 py-1 ${
            isActive('/') ? 'outline outline-2 outline-black' : ''
          }`}>
            {currentPage}
          </div>
        </div>
        
        {/* Menu button on right */}
        <div className="flex justify-end">
          <button 
            className="p-2"
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
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-primary z-40 outline outline-2 outline-black transition-all duration-300 ease-in-out ${
        mobileNavOpen 
          ? 'opacity-100 translate-y-0 visible' 
          : 'opacity-0 -translate-y-4 invisible'
      }`}>
        <nav className="py-4">
          <div className="flex flex-col items-center space-y-4">
            {navItems.map((item) => {
              // Don't show the current page in the dropdown
              if (isActive(item.path)) return null
              
              return item.external ? (
                <a
                  key={item.name}
                  href={item.path}
                  className="font-slimbold text-base text-black px-4 py-2 hover:outline hover:outline-2 hover:outline-black transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.path}
                  className="font-slimbold text-base text-black px-4 py-2 hover:outline hover:outline-2 hover:outline-black transition-all"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}