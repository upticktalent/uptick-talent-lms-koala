'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Zap, BookOpen } from 'lucide-react';
import { tracks } from '@/lib/track-data';
import { Wave } from '../../../public/images';
import Box from '../ui/box';

export default function TrackGrid() {
  return (
    <Box className="relative">
      {/* Background */}
      <Box className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
        <Image src={Wave} alt="wave-bg" fill className="object-cover" quality={75} />
      </Box>

      {/* Grid Container */}
      <Box className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-5">
        {tracks.map(track => (
          <Link
            key={track.slug}
            href={`/tracks/${track.slug}`}
            className="group h-full focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl"
          >
            <Box className="relative h-full bg-[#1C1C1C] backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 flex flex-col hover:from-slate-800/60 hover:to-slate-900/60">
              <Box className="absolute top-0 right-0 w-32 h-32 bg-[#1C1C1C] group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-2xl -mr-16 -mt-16" />

              <Box className="relative w-full h-48 sm:h-52 md:h-48 bg-[#1C1C1C] flex items-center justify-center overflow-hidden flex-shrink-0">
                <Box className="absolute inset-0 bg-[#1C1C1C] transition-opacity duration-300" />

                <Image
                  src={track.icon.src}
                  alt={track.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                />
              </Box>

              {/* Content */}
              <Box className="relative p-5 sm:p-6 flex flex-col flex-grow">
                {/* Badge */}
                <Box className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium w-fit">
                  <BookOpen className="w-3 h-3" />
                  Course
                </Box>

                <Box className="flex-grow mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {track.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors">
                    {track.summary}
                  </p>
                </Box>

                {/* Info */}
                <Box className="flex flex-wrap items-center gap-3 sm:gap-4 py-4 border-t border-slate-700/50 text-xs sm:text-sm text-slate-400">
                  {track.duration && (
                    <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Clock className="w-3.5 h-3.5 text-primary/60" />
                      <span className="font-medium">{track.duration}</span>
                    </span>
                  )}
                  {track.duration && track.level && (
                    <Box className="w-1 h-1 rounded-full bg-slate-600" />
                  )}
                  {track.level && (
                    <span className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                      <Zap className="w-3.5 h-3.5 text-amber-500/60" />
                      <span className="font-medium">{track.level}</span>
                    </span>
                  )}
                </Box>

                {/* CTA */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-[#477BFF]  text-white rounded-lg font-semibold text-sm sm:text-base  transition-all duration-200 group/btn mt-auto cursor-pointer">
                  View Details
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </Box>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
