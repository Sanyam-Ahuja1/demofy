import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Demofy, our mission to deliver quality products, and our commitment to excellence.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-6">
          About Demofy
        </h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-lg text-neutral-700 leading-relaxed mb-6">
            Demofy connects you directly with the best producers to bring high-quality products
            straight to your door. We believe in sustainable farming practices and supporting our
            local agricultural community.
          </p>

          <h2 className="text-2xl font-display font-bold text-neutral-900 mt-8 mb-4">
            Our Mission
          </h2>
          <p className="text-neutral-700 leading-relaxed mb-6">
            To make fresh, organic, and sustainable farm products accessible to everyone while
            supporting local farmers and reducing food miles. We&apos;re committed to quality,
            transparency, and building a healthier community.
          </p>

          <h2 className="text-2xl font-display font-bold text-neutral-900 mt-8 mb-4">
            Why Choose Us?
          </h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-6">
            <li>100% Organic and pesticide-free products</li>
            <li>Direct from farm to your table</li>
            <li>Support for local farming communities</li>
            <li>Sustainable and eco-friendly practices</li>
            <li>Fresh products delivered daily</li>
          </ul>

          <h2 className="text-2xl font-display font-bold text-neutral-900 mt-8 mb-4">
            Our Commitment
          </h2>
          <p className="text-neutral-700 leading-relaxed">
            We work closely with our partner farms to ensure the highest quality standards.
            Every product is carefully selected, harvested at peak ripeness, and delivered with care.
            Your health and satisfaction are our top priorities.
          </p>
        </div>
      </div>
    </div>
  );
}
