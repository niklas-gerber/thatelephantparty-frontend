import Link from 'next/link'

export default function Pagination({
  currentPage,
  totalPages
}: {
  currentPage: number
  totalPages: number
}) {
  return (
    <div className="pagination flex justify-center items-center py-4 md:py-8">
      <div className="pages text-center font-slimbold text-lg md:text-xl lg:text-2xl flex flex-wrap justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={`/?page=${page}`}
            className={`px-3 py-1 md:px-4 md:py-2 ${
              currentPage === page
                ? 'bg-[var(--color-pagination-active-bg)] text-[var(--color-pagination-active-text)]'
                : 'bg-[var(--color-pagination-inactive-bg)] text-[var(--color-pagination-inactive-text)]'
            }`}
          >
            {page}
          </Link>
        ))}
      </div>
    </div>
  )
}