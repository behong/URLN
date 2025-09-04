
import React, { useState } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner.tsx';

interface URLFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const URLForm: React.FC<URLFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Simple URL validation
      new URL(url);
      onSubmit(url);
      setUrl(''); // Clear input on successful submission
    } catch (_) {
      setError('유효한 URL을 입력해주세요. (예: https://example.com)');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="url-input" className="block text-sm font-medium text-slate-300 mb-2">
          URL 주소
        </label>
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={handleInputChange}
          placeholder="https://google.com"
          required
          disabled={isLoading}
          className={`w-full px-4 py-3 bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            전송 중...
          </>
        ) : (
          '전송'
        )}
      </button>
    </form>
  );
};