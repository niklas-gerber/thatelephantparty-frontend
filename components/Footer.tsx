import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary outline outline-2 outline-black py-[2vw] px-4 text-center">
      <div className="flex justify-center items-center text-[1.5vw] md:text-[1rem]">
        <Link 
          href="https://www.instagram.com/thatelephantparty/" 
          className="font-slimbold hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          INSTAGRAM
        </Link>
        <span className="mx-[0.8vw]">|</span>
        <Link 
          href="/contact" 
          className="font-slimbold hover:underline"
        >
          CONTACT
        </Link>
      </div>
    </footer>
  )
}