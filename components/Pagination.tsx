import Link from 'next/link'

export default function Pagination({
  currentPage,
  totalPages
}: {
  currentPage: number
  totalPages: number
}) {
  return (
    <div className="flex justify-center items-center font-slimbold text-[3vw] md:text-[1.2rem]">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={`/?page=${page}`}
          className={`mx-1 px-3 py-1 rounded ${
            currentPage === page
              ? 'bg-primary text-white'
              : 'bg-white text-primary border border-primary hover:bg-primary hover:text-white'
          } transition-colors`}
        >
          {page}
        </Link>
      ))}
    </div>
  )
}