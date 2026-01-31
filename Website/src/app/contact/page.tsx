'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { Button } from '@/ui/primitives/Button';
import { Input } from '@/ui/primitives/Input';
import { Card } from '@/ui/primitives/Card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-6">
          Contact Us
        </h1>
        <p className="text-neutral-600 mb-8">
          Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Your name"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="your@email.com"
              required
            />

            <Input
              label="Subject"
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              placeholder="What is this about?"
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Your message..."
                required
                rows={6}
                className="px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              Send Message
            </Button>
          </form>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="md">
            <h3 className="font-semibold text-lg mb-2">Email</h3>
            <p className="text-neutral-600">support@demofy.com</p>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-lg mb-2">Phone</h3>
            <p className="text-neutral-600">+91 1234567890</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
