import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CatalogLoadErrorProps {
  message: string;
  onRetry: () => void;
}

export const CatalogLoadError: React.FC<CatalogLoadErrorProps> = ({ message, onRetry }) => (
  <div
    role="alert"
    className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3"
  >
    <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h2 className="font-serif font-bold text-lg text-stone-800">Farm catalog unavailable</h2>
    <p className="text-xs text-stone-600 max-w-xl mx-auto">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      Retry catalog
    </button>
  </div>
);