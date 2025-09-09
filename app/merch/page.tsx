import Image from 'next/image'

export default function MerchPage() {
  return (
    <div className="pb-8 md:pb-12">
      <div className="h-8 md:h-12"></div>
      
      {/* Page Title with Underscore - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <div className="text-center font-slimbold text-2xl px-6 py-4 w-fit mx-auto text-black">
          MERCH
        </div>
        {/* Elegant underscore */}
        <div className="w-1/3 mx-auto border-t-2 border-black mb-8"></div>
      </div>
      
      {/* Merch Content */}
      <div className="font-slimbold text-black mx-auto w-full max-w-[90vw] md:max-w-[80vw] p-4 md:p-8">
        {/* Merch Title */}
        <div className="text-center text-xl md:text-2xl mb-2 md:mb-4 px-4 py-2 w-full mx-auto">
          Faith is for Everyone (Shirts)
        </div>
        
        {/* Merch Images */}
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 my-4 md:my-8">
          <Image
            src="/images/merch/merch1.jpg"
            alt="Merchandise 1"
            width={400}
            height={500}
            className="block mx-auto w-full max-w-[80vw] md:max-w-[40vw] shadow-[0_0_0_2vw] md:shadow-[0_0_0_3vw] shadow-black"
          />
          <Image
            src="/images/merch/merch2.jpg"
            alt="Merchandise 2"
            width={400}
            height={500}
            className="block mx-auto w-full max-w-[80vw] md:max-w-[40vw] shadow-[0_0_0_2vw] md:shadow-[0_0_0_3vw] shadow-black mt-4 md:mt-0"
          />
        </div>
        
        {/* Added more space here with larger margin */}
        <div className="mt-6 md:mt-8 space-y-1 md:space-y-2 text-center">
          <div className="text-base md:text-lg lg:text-xl font-slim">
            Ivory (S/M) or White (XS/XL)
          </div>
          <div className="text-base md:text-lg lg:text-xl font-slim">
            PHP 1299
          </div>
        </div>
        
        {/* Sold Out Notice with black square */}
        <div className="text-center font-slimbold text-xl md:text-2xl px-6 py-4 mt-8 md:mt-12 outline outline-2 outline-black w-fit mx-auto">
          SOLD OUT
        </div>
      </div>
      
      <div className="h-8 md:h-12"></div>
    </div>
  )
}