// Footer Component

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <div className="container mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* About */}
          <div>
            <h3 className="font-display font-bold text-white text-lg mb-4">Demofy</h3>
            <p className="text-sm text-neutral-400">
              The premier platform for demonstrating your projects. Showcase your work with style and ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-white mb-4">Policies</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/policies/privacy" className="text-sm hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="text-sm hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>Email: support@demofy.com</li>
              <li>Phone: +91 1234567890</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 sm:pt-8 px-4 sm:px-0 text-center text-sm text-neutral-400">
          <p>&copy; {currentYear} Demofy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
