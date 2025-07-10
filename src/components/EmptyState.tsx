import React from 'react';
import { Plus, Target } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  message, 
  actionText, 
  onAction, 
  icon 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
        {icon || <Target className="w-10 h-10 text-gray-500" />}
      </div>
      
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 mb-8 max-w-md leading-relaxed">{message}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}