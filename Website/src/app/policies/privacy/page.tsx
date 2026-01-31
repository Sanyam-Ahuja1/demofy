import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Demofy privacy policy and data protection information.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-neutral-500 mb-8">Last updated: January 2026</p>

        <div className="prose prose-neutral max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Information We Collect
            </h2>
            <p className="text-neutral-700">
              We collect information you provide directly to us, including name, email address,
              phone number, shipping address, and payment information when you make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              How We Use Your Information
            </h2>
            <p className="text-neutral-700">
              We use the information we collect to process your orders, communicate with you,
              and improve our services. We may also use your information to send you marketing
              communications if you have opted in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Data Security
            </h2>
            <p className="text-neutral-700">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Your Rights
            </h2>
            <p className="text-neutral-700">
              You have the right to access, update, or delete your personal information. Contact us
              at support@demofy.com to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Contact Us
            </h2>
            <p className="text-neutral-700">
              If you have any questions about this Privacy Policy, please contact us at
              support@demofy.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
