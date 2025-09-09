import { fetchPageContent } from '@/lib/api'
import Image from 'next/image'

// Member data - stored locally since it rarely changes
const coreMembers = [
  {
    name: "Shahani Gania SuperStarletXXX",
    pronouns: "He/Him/She/Her/They/Them",
    role: "Founder, Drag Queen, Host, Stylist",
    image: "/images/members/shahani-gania.jpg"
  },
  {
    name: "Paul Jatayna",
    pronouns: "He/Him/They",
    role: "Founder, Production Designer, Stylist, Artist, DJ",
    image: "/images/members/paul-jatayna.jpg"
  },
  {
    name: "Alexa Dignos",
    pronouns: "She/Her",
    role: "DJ, Stylist",
    image: "/images/members/alexa-dignos.jpg"
  },
  {
    name: "Aly Cabral (T33G33)",
    pronouns: "She/Her",
    role: "DJ, Artist",
    image: "/images/members/aly-cabral.jpg"
  },
  {
    name: "Andi Osmena",
    pronouns: "He/They",
    role: "DJ, Artist, CEO of Estes Estes Estes",
    image: "/images/members/andi-osmena.jpg"
  },
  {
    name: "Celeste Lapida",
    pronouns: "She/Her",
    role: "DJ, Artist, Host, Performer, Owner, CEO, Capitalist of Estes Estes Estes",
    image: "/images/members/celeste-lapida.jpg"
  },
  {
    name: "Lance Navasca",
    pronouns: "They/Them",
    role: "Model, Artist",
    image: "/images/members/lance-navasca.jpg"
  }
]

export default async function AboutPage() {
  const pageData = await fetchPageContent('about')
  
  // If no data from API, use fallback content
  const content = pageData?.content || 
    "ELEPHANT is a nomadic queer techno dance party based in Manila, organized by a collective of LGBTQIA+ artists, DJs, activists and performers. \\n ELEPHANT advocates for safer spaces for the community and equitable pay among artists."

  return (
    <div className="pb-8 md:pb-12">
      <div className="h-8 md:h-12"></div>
      
      {/* Page Title with Underscore - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <div className="text-center font-slimbold text-2xl px-6 py-4 w-fit mx-auto text-black">
          ABOUT
        </div>
        {/* Elegant underscore */}
        <div className="w-1/3 mx-auto border-t-2 border-black mb-8"></div>
      </div>
      
      {/* About Image */}
      <div className="flex justify-center mb-8 md:mb-12">
        <Image
          src="/images/about-picture.jpg"
          alt="ELEPHANT Party"
          width={600}
          height={400}
          className="w-full max-w-[90vw] md:max-w-[50vw] outline outline-4 outline-black"
        />
      </div>
      
      {/* Content from backend */}
      <div className="font-slim text-base md:text-lg lg:text-xl text-black mx-auto w-full max-w-[90vw] md:max-w-[60vw] text-center leading-relaxed mb-8 md:mb-12">
        {content.split('\\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
      
      {/* Divider */}
      <div className="w-1/3 mx-auto border-t-2 border-black mb-8 md:mb-12"></div>
      
      {/* Core Members Title */}
      <div className="text-center font-slimbold text-2xl md:text-3xl text-black mb-8 md:mb-12">
        Core Members
      </div>
      
      {/* Core Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mx-auto w-full max-w-[90vw] md:max-w-[80vw]">
        {coreMembers.map((member, index) => (
          <div key={index} className="bg-white p-4 md:p-6 text-center shadow-lg border-2 border-black">
            {/* Member Image - Fixed to prevent cropping */}
            <div className="mb-4 flex justify-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-contain outline outline-2 outline-black"
                  sizes="(max-width: 768px) 128px, 160px"
                />
              </div>
            </div>
            
            {/* Member Name - Changed to primary color */}
            <h3 className="font-slimbold text-lg md:text-xl mb-2 text-[var(--color-primary)]">
              {member.name}
            </h3>
            
            {/* Pronouns - Changed back to black */}
            <p className="font-slim text-sm md:text-base text-black mb-2">
                {member.pronouns}
            </p>

            {/* Role - Changed back to black */}
            <p className="font-slim text-sm md:text-base text-black">
                {member.role}
            </p>
          </div>
        ))}
      </div>
      
      <div className="h-8 md:h-12"></div>
    </div>
  )
}