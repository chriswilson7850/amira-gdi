import HeroSection from '@/components/home/hero-section';
import ProductCarousel from '@/components/home/product-carousel';
import MintCarousel from '@/components/home/mint-carousel';
import ReviewsSection from '@/components/home/reviews-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductCarousel />
      <ReviewsSection />
      <MintCarousel />
    </>
  );
}
