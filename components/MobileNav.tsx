import Link from 'next/link'

export default function MobileNav({ onClose }: { onClose: () => void }) {
  return (
    <nav className="py-4">
      <ul className="flex flex-col items-center space-y-4">
        {['EVENTS', 'PODCAST', 'MERCH', 'FUNDRAISER', 'FEATURES', 'CONTACT', 'ABOUT'].map((item) => (
          <li key={item}>
            <Link 
              href={`/${item.toLowerCase()}`} 
              className="font-slimbold text-[6vw] px-4 py-2 hover:outline hover:outline-2 hover:outline-black block"
              onClick={onClose}
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}