export default function FundraiserPage() {
  return (
    <div className="pb-8 md:pb-12">
      <div className="h-8 md:h-12"></div>
      
      {/* Page Title with Underscore - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <div className="text-center font-slimbold text-2xl px-6 py-4 w-fit mx-auto text-black">
          FUNDRAISER
        </div>
        {/* Elegant underscore */}
        <div className="w-1/3 mx-auto border-t-2 border-black mb-8"></div>
      </div>
      
      {/* Content */}
      <div className="font-slim text-base md:text-lg lg:text-xl text-black mx-auto w-full max-w-[90vw] md:max-w-[60vw] text-center leading-relaxed">
        <p>Coming soon!</p>
      </div>
    </div>
  )
}