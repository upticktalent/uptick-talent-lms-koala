import Image from 'next/image';
import { Overlay } from '../../../public/images';
import Box from '../ui/box';
import { features } from '@/lib/about-data';
import { Button } from '../ui/button';

export default function About() {
  return (
    <section
      className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32 overflow-hidden"
      id="about"
    >
      {/* Overlay */}
      <Box className="absolute inset-0 z-10">
        <Image src={Overlay} alt="Overlay background" fill className="object-cover" quality={75} />
      </Box>

      <Box className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header */}
        <Box className="mb-12 sm:mb-16 md:mb-20 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
            At <span className="text-primary">Uptick Talent</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto px-2 sm:px-0 leading-relaxed">
            We&apos;re committed to bridging the gap between aspiring tech professionals and
            industry opportunities through comprehensive, career-focused learning programs.
          </p>
        </Box>

        {/* Main Content Grid */}
        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 mb-16 sm:mb-20 md:mb-24 items-center">
          {/* Left Content */}
          <Box className="order-2 lg:order-1">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Empowering the Next Generation of Tech Talent
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed">
              At Uptick Talent, we believe that quality education should be accessible to everyone.
              Our platform combines cutting-edge curriculum with personalized mentorship to help you
              succeed in tech.
            </p>
            <p className="text-sm sm:text-base text-gray-300 mb-6 md:mb-8 leading-relaxed">
              Whether you&apos;re just starting your coding journey or looking to transition into
              tech, our carefully curated tracks are designed to meet you where you are and take you
              where you want to go.
            </p>
            <Button className="px-6 md:px-8 py-2.5 md:py-3 bg-[#477BFF] hover:bg-[#477BFF]/90 text-white rounded-lg font-semibold transition-all duration-200 text-sm md:text-base cursor-pointer">
              Learn More
            </Button>
          </Box>

          {/* Features Grid */}
          <Box className="order-1 lg:order-2">
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Box
                    key={index}
                    className="group p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl hover:border-primary/50 hover:bg-slate-900/80 transition-all duration-300"
                  >
                    <Icon className="w-6 sm:w-8 h-6 sm:h-8 text-primary mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Stats Section */}
        <Box className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 py-12 sm:py-16 border-t border-b border-slate-800">
          {[
            { number: '5,000+', label: 'Active Students' },
            { number: '50+', label: 'Industry Experts' },
            { number: '15+', label: 'Program Tracks' },
            { number: '95%', label: 'Success Rate' },
          ].map((stat, index) => (
            <Box key={index} className="text-center">
              <Box className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
                {stat.number}
              </Box>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">{stat.label}</p>
            </Box>
          ))}
        </Box>

        {/* Call to Action */}
        <Box className="mt-12 sm:mt-16 md:mt-20 text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Ready to Start Your Journey?
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Choose your learning path and join thousands of students who are transforming their
            careers with Uptick Talent.
          </p>
          <Button className="px-6 md:px-10 py-3 md:py-3 bg-[#477BFF] hover:bg-[#477BFF]/90 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-sm md:text-base shadow-lg cursor-pointer">
            Explore Programs
          </Button>
        </Box>
      </Box>
    </section>
  );
}
