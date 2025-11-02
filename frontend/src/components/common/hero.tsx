import Image from 'next/image';
import { Background } from '../../../public/images';
import Box from '../ui/box';

export default function Hero() {
  return (
    <section className="relative min-h-screen px-4 vector-black-bg sm:px-6 lg:px-8 flex items-center justify-center text-center overflow-hidden bg-gradient-to-b from-slate-950 to-black border-t border-slate-800">
      {/* Background Image */}
      <Image
        src={Background}
        alt="Background"
        fill
        className="object-cover absolute inset-0 z-0"
        priority
      />

      {/* Content */}
      <Box className="relative z-10 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 font-raleway leading-tight">
          Learn. Grow. Launch Your{' '}
          <span className="text-primary drop-shadow-[0_0_10px_rgba(16,110,190,0.8)]">
            Tech Career
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-200 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0 leading-relaxed">
          Join industry-leading programs designed to transform your skills and accelerate your path
          to success in tech.
        </p>
        <button className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors inline-block shadow-lg hover:shadow-xl cursor-pointer">
          Start Exploring
        </button>
      </Box>
    </section>
  );
}
