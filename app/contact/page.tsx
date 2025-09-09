import { fetchPageContent } from '@/lib/api'

export default async function ContactPage() {
  const pageData = await fetchPageContent('contact')
  
  // If no data from API, use fallback content
  const content = pageData?.content || 
    "For ticket informations, email us at elephantpartypreregistration@gmail.com or DM @thatelephantparty/@lancenavasca on instagram. \n Elephant Party is always looking for volunteers, if you are queer and know anything about production, send us a DM @thatelephantparty on instagram."

  return (
    <div className="pb-8 md:pb-12">
      <div className="h-8 md:h-12"></div>
      
      {/* Page Title with Underscore - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <div className="text-center font-slimbold text-2xl px-6 py-4 w-fit mx-auto text-black">
          CONTACT
        </div>
        {/* Elegant underscore - moved closer to title */}
        <div className="w-1/3 mx-auto border-t-2 border-black mb-8"></div>
      </div>
      
      {/* Content */}
      <div className="font-slim text-base md:text-lg lg:text-xl text-black mx-auto w-full max-w-[90vw] md:max-w-[60vw] text-center leading-relaxed">
        {content.split('\\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}