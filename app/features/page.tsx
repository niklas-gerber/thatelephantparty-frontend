import Image from 'next/image'
import Link from 'next/link'

// Feature data - hardcoded since it rarely changes
const features = [
  {
    id: 1,
    title: "That Elephant Party creates safe spaces within Manila’s nightlife scene",
    author: "by Kara Angan on l!fe (The Philippine Star)",
    link: "https://philstarlife.com/geeky/129117-that-elephant-party-creates-safe-spaces-manila-nightlife-scene",
    date: "March 24, 2023",
    image: "/images/features/f1.jpg"
  },
  {
    id: 2,
    title: "Manila’s fave queer party Elephant gets love in this docuseries",
    author: "by Amrie Cruz on preen.ph",
    link: "https://preen.ph/129435/manila-queer-party-elephant-in-docu-series",
    date: "February 18, 2022",
    image: "/images/features/f2.jpg"
  },
  {
    id: 3,
    title: "''The future is queer'': Discover the enduring manifesto of the Filipino queer rave collective Elephant",
    author: "by Samantha Nicole on MixMag Asia",
    link: "https://mixmag.asia/feature/discover-the-enduring-manifesto-filipino-queer-rave-collective-elephant",
    date: "October 26, 2021",
    image: "/images/features/f3.jpg"
  },
  {
    id: 4,
    title: "Queer Spaces: The Elephant Party at XX XX, Makati",
    author: "by Christian San Jose, Celeste Lapida and Shahani Gania on NOLISOLI",
    link: "https://nolisoli.ph/97980/xx-xx-the-elephant-party-queer-spaces-20210630/",
    date: "June 30, 2021",
    image: "/images/features/f4.jpg"
  },
  {
    id: 5,
    title: "Elephant Party is Not Your Usual Night Out",
    author: "by Miko Borje on PURVEYR",
    link: "https://purveyr.com/2018/08/22/elephant-party-is-not-your-usual-night-out/",
    date: "August 22, 2018",
    image: "/images/features/f5.jpg"
  }
]

export default function FeaturesPage() {
  return (
    <div className="pb-8 md:pb-12">
      <div className="h-8 md:h-12"></div>
      
      {/* Page Title with Underscore - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <div className="text-center font-slimbold text-2xl px-6 py-4 w-fit mx-auto text-black">
          FEATURES
        </div>
        {/* Elegant underscore */}
        <div className="w-1/3 mx-auto border-t-2 border-black mb-8"></div>
      </div>
      
      {/* Features Grid */}
      <div className="space-y-8 md:space-y-12 mx-auto w-full max-w-[90vw] md:max-w-[80vw]">
        {features.map((feature) => (
          <div key={feature.id} className="font-slimbold text-black mx-auto w-full p-4 md:p-8">
            {/* Article Title */}
            <div className="text-center text-xl md:text-2xl mb-2 md:mb-4 px-4 py-2 w-full mx-auto">
              {feature.title}
            </div>
            
            {/* Feature Image */}
            <div className="flex justify-center">
                    <Link href={feature.link} target="_blank" rel="noopener noreferrer">
                        <Image
                            src={feature.image}
                            alt={feature.title}
                            width={600}
                            height={400}
                            className="block mx-auto w-full max-w-[80vw] md:max-w-[40vw] shadow-[0_0_0_2vw] md:shadow-[0_0_0_3vw] shadow-black hover:shadow-[0_0_0_2.2vw] md:hover:shadow-[0_0_0_3.2vw] transition-all duration-300 my-4 md:my-8"
                        />
                    </Link>
            </div>

            {/* Article Info */}
            <Link href={feature.link} target="_blank" rel="noopener noreferrer">
              <div className="mt-2 md:mt-4 space-y-1 md:space-y-2">
                <div className="text-center text-base md:text-lg font-slim">
                  {feature.author}
                </div>
                <div className="text-center text-base md:text-lg font-slim">
                  {feature.date}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      <div className="h-8 md:h-12"></div>
    </div>
  )
}