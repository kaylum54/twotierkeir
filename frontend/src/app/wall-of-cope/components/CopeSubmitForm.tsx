'use client';

import { useState } from 'react';

interface CopeSubmitFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export const CopeSubmitForm = ({ onClose, onSubmit }: CopeSubmitFormProps) => {
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [platform, setPlatform] = useState('x');
  const [category, setCategory] = useState('copium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.length < 20) {
      setError('Cope must be at least 20 characters');
      return;
    }

    if (content.length > 500) {
      setError('Cope must be less than 500 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/cope/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          source_url: sourceUrl || null,
          source_platform: platform,
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Submission failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onSubmit();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center bg-purple-800 text-white rounded-t-lg">
          <h2 className="font-typewriter text-xl">📤 SUBMIT COPE</h2>
          <button onClick={onClose} className="text-2xl hover:opacity-70">
            &times;
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="font-typewriter text-xl mb-2">Submitted!</h3>
            <p className="text-gray-600">
              Your cope has been submitted for review. It will appear on the wall
              once approved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                The Cope <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the delusional defence here..."
                rows={4}
                className="w-full border rounded px-3 py-2 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Source URL (optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://x.com/..."
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="x">𝕏 (Twitter)</option>
                  <option value="reddit">Reddit</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="denial">🙈 Denial</option>
                  <option value="deflection">👉 Deflection</option>
                  <option value="whatabout">🔄 Whataboutism</option>
                  <option value="copium">💨 Pure Copium</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
              <strong>Note:</strong> Submissions are reviewed before appearing.
              We&apos;re looking for genuine cope, not made-up quotes. Source links
              help us verify.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-700 text-white py-3 rounded font-typewriter
                       hover:bg-purple-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
