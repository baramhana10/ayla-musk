import IntroVeil from "@/components/home/IntroVeil";
import IntroLoader from "@/components/home/IntroLoader";
import Hero from "@/components/home/Hero";
import BrandStrip from "@/components/home/BrandStrip";
import CollectionPillars from "@/components/home/CollectionPillars";
import Bestsellers from "@/components/home/Bestsellers";
import EditorialBanner from "@/components/home/EditorialBanner";
import Testimonials from "@/components/home/Testimonials";
import InstaGallery from "@/components/home/InstaGallery";
import NewsletterBanner from "@/components/home/NewsletterBanner";

export default function HomePage() {
  return (
    <div className="home-warm">
      <IntroVeil />
      <IntroLoader />
      <Hero />
      <BrandStrip />
      <CollectionPillars />
      <Bestsellers />
      <EditorialBanner />
      <Testimonials />
      <InstaGallery />
      <NewsletterBanner />
    </div>
  );
}
