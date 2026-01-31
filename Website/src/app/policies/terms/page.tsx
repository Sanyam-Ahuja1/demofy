import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Demofy terms of service and user agreement.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-6">
          Terms of Service
        </h1>
        <p className="text-sm text-neutral-500 mb-8">Last updated: January 2026</p>

        <div className="prose prose-neutral max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-neutral-700">
              By accessing and using Demofy&apos;s services, you accept and agree to be bound by the
              terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Use of Service
            </h2>
            <p className="text-neutral-700">
              Our service allows you to purchase fresh organic products from local farms. You agree
              to use the service only for lawful purposes and in accordance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Product Quality
            </h2>
            <p className="text-neutral-700">
              We strive to provide the highest quality organic products. However, as natural products,
              slight variations may occur. We guarantee freshness and will replace any products that
              do not meet our quality standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Returns and Refunds
            </h2>
            <p className="text-neutral-700">
              If you are not satisfied with your purchase, please contact us within 24 hours of
              delivery. We will arrange for a replacement or refund as appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Limitation of Liability
            </h2>
            <p className="text-neutral-700">
              Demofy shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Contact Information
            </h2>
            <p className="text-neutral-700">
              For questions about these Terms of Service, please contact us at support@demofy.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
