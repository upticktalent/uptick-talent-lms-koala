import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users, Clock, Zap, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { tracks } from '@/lib/track-data';
import Box from '@/components/ui/box';
import { AboutPattern } from '../../../../public/images';

interface TrackDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return tracks.map(track => ({
    slug: track.slug,
  }));
}

export async function generateMetadata({ params }: TrackDetailPageProps) {
  const { slug } = await params;
  const track = tracks.find(t => t.slug === slug);

  if (!track) {
    return {
      title: 'Track Not Found | Uptick LMS',
      description: "The track you're looking for doesn't exist.",
    };
  }

  return {
    title: `${track.title} | Uptick LMS`,
    description: track.summary,
    openGraph: {
      title: `${track.title} | Uptick LMS`,
      description: track.summary,
      type: 'website',
    },
  };
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
  const { slug } = await params;
  const track = tracks.find(t => t.slug === slug);

  if (!track) {
    notFound();
  }

  return (
    <main className="min-h-screen relative bg-black pt-24 overflow-hidden">
      {/* Background Pattern */}
      <Image src={AboutPattern} alt="about-pattern" fill className="object-cover  z-10" priority />

      {/* Back Navigation */}
      <Box className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm sm:text-base group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Tracks
        </Link>
      </Box>

      {/* Hero Section */}
      <Box className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Image */}
          <Box className="md:col-span-1">
            <Box className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-800 to-slate-900 group">
              <Image
                src={track.icon}
                alt={track.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <Box className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </Box>
          </Box>

          {/* Content */}
          <Box className="md:col-span-2 flex flex-col justify-center">
            <Box className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Course
              </span>
            </Box>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              {track.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-300 mb-6 md:mb-8 leading-relaxed">
              {track.summary}
            </p>

            {/* Key Stats */}
            <Box className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-slate-800">
              <Box className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <Box>
                  <p className="text-xs sm:text-sm text-gray-400">Duration</p>
                  <p className="text-sm sm:text-base font-semibold text-white">{track.duration}</p>
                </Box>
              </Box>
              <Box className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <Box>
                  <p className="text-xs sm:text-sm text-gray-400">Level</p>
                  <p className="text-sm sm:text-base font-semibold text-white">{track.level}</p>
                </Box>
              </Box>
              <Box className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <Box>
                  <p className="text-xs sm:text-sm text-gray-400">Enrolled</p>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {track.applicants.toLocaleString()}+
                  </p>
                </Box>
              </Box>
            </Box>

            {/* Enroll CTA */}
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 md:py-4 bg-[#477BFF] text-white rounded-lg font-semibold hover:bg-[#477BFF]/90 transition-all duration-200">
              Apply Now
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <Box className="space-y-8 md:space-y-12">
          {/* About Section */}
          <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 sm:p-8 md:p-10 hover:border-slate-700 transition-all duration-300">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
              About This Track
            </h2>
            <p className="text-gray-300 leading-relaxed text-base md:text-lg">
              {track.description}
            </p>
          </section>

          <Box className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Prerequisites */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 sm:p-8 hover:border-slate-700 transition-all duration-300">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Prerequisites</h2>
              <ul className="space-y-3">
                {track.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Box className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Box className="w-2 h-2 bg-primary rounded-full" />
                    </Box>
                    <span className="text-gray-300 text-sm md:text-base">{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Learning Outcomes */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 sm:p-8 hover:border-slate-700 transition-all duration-300">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
                What You&apos;ll Learn
              </h2>
              <ul className="space-y-3">
                {track.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500/70 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm md:text-base">{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Box>

          {/* CTA */}
          <Box className="relative z-20 bg-gradient-to-br from-primary/20 via-transparent to-blue-600/20 border border-primary/30 rounded-2xl p-6 sm:p-8 md:p-12 text-center overflow-hidden group">
            <Box className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <Box className="relative">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
                Ready to Transform Your Career?
              </h3>
              <p className="text-gray-300 text-base md:text-lg mb-6 md:mb-8 max-w-3xl mx-auto">
                Join {track.applicants.toLocaleString()}+ learners in the {track.title} track and
                start your journey to success today.
              </p>
              <button className="inline-flex items-center gap-2 px-6 sm:px-10 py-3 md:py-4 bg-[#477BFF] text-white rounded-lg font-semibold hover:bg-[#477BFF]/90 transition-all duration-200 text-sm md:text-base">
                Apply Now
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="py-8 sm:py-12" />
    </main>
  );
}
