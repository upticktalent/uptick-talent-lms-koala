import React from 'react';
import TrackGrid from './track-grid';
import Box from '../ui/box';

export default function Tracks() {
  return (
    <section
      className="w-full py-8 sm:py-12 md:py-20 lg:py-24 scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-32"
      id="tracks"
    >
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Box className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-3 text-balance leading-tight">
            Explore Our Program Tracks
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Choose your learning path and start your journey with Uptick Talent
          </p>
        </Box>
        <TrackGrid />
      </Box>
    </section>
  );
}
