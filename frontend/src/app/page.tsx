import About from '@/components/common/about';
import FAQ from '@/components/common/faq';
import Footer from '@/components/common/footer';
import Header from '@/components/common/header';
import Hero from '@/components/common/hero';
import Tracks from '@/components/common/tracks';

export default function Home() {
  return (
    <main className="min-h-screen ">
      <Header />
      <Hero />
      <About />
      <Tracks />
      <FAQ />
      <Footer />
    </main>
  );
}
