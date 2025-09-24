'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SubscribePage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ email: '', name: '' });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Something went wrong',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              ← Back to newsletter
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Subscribe</h1>
            <div className="invisible">← Back to newsletter</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join the Newsletter
              </h2>
              <p className="text-gray-600">
                Get the latest posts delivered directly to your inbox. No spam,
                unsubscribe at any time.
              </p>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By subscribing, you agree to receive newsletter emails. You can
                unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What you&apos;ll get:
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 text-green-500">✓</span>
                <span className="ml-2">
                  Latest posts delivered to your inbox
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 text-green-500">✓</span>
                <span className="ml-2">Exclusive content and insights</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 text-green-500">✓</span>
                <span className="ml-2">
                  No spam, no ads, just quality content
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 text-green-500">✓</span>
                <span className="ml-2">Unsubscribe anytime with one click</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
