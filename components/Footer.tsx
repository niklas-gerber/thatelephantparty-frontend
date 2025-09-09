import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary outline outline-2 outline-black py-4 md:py-6">
      <div className="flex justify-center items-center font-slimbold text-sm md:text-base">
        <Link 
          href="https://www.instagram.com/thatelephantparty/" 
          className="text-black hover:underline px-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          INSTAGRAM
        </Link>
        <span className="text-black px-2">|</span>
        <Link 
          href="/contact" 
          className="text-black hover:underline px-2"
        >
          CONTACT
        </Link>
      </div>
    </footer>
  )
}