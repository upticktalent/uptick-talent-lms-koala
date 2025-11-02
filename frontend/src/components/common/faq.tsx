import Image from 'next/image';
import { AboutPattern } from '../../../public/images';
import Box from '../ui/box';
import Accordion from './accordion';

export default function FAQ() {
  return (
    <section
      className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32 overflow-hidden bg-black"
      id="faq"
    >
      <Image src={AboutPattern} alt="faq-overlay" fill className="object-cover z-10" priority />

      <Box className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Header */}
        <Box className="mb-12 sm:mb-16 md:mb-20 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto px-2 sm:px-0 leading-relaxed">
            Got questions? We&apos;ve got answers. Check out our most common FAQs to learn more
            about our programs and how we can help you succeed.
          </p>
        </Box>

        {/* Accordion */}
        <Accordion />

        {/*  CTA */}
        <Box className="mt-12 sm:mt-16 md:mt-20 bg-gradient-to-br from-primary/20 via-transparent to-blue-600/20 border border-primary/30 rounded-2xl p-6 sm:p-8 md:p-12 text-center relative overflow-hidden group">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            Still have questions?
          </h3>
          <p className="text-sm sm:text-base text-gray-300 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Please reach out to our support
            team.
          </p>
          <button className="px-6 md:px-8 py-2.5 md:py-3 bg-[#477BFF] hover:bg-[#477BFF]/90 text-white rounded-lg font-semibold h transition-all duration-200 text-sm md:text-base cursor-pointer">
            Contact Support
          </button>
        </Box>
      </Box>
    </section>
  );
}
