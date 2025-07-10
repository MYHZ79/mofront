import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  Shield,
  Target,
  Timer,
  Award,
  Ban,
  Hourglass,
  Star,
  AlertCircle
} from 'lucide-react';

interface StatusBadgeProps {
  type: 'deadline' | 'supervision';
  status: 'active' | 'completed' | 'failed' | 'expired' | 'pending' | 'approved' | 'rejected' | 'not_supervised';
  tooltip?: string;
}

export function StatusBadge({ type, status, tooltip }: StatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusConfig = () => {
    const configs = {
      deadline: {
        active: {
          icon: <Timer className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          hoverBg: 'hover:from-blue-400 hover:to-cyan-400'
        },
        completed: {
          icon: <Star className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-br from-emerald-500 to-green-500',
          hoverBg: 'hover:from-emerald-400 hover:to-green-400'
        },
        expired: {
          icon: <Hourglass className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-br from-red-500 to-orange-500',
          hoverBg: 'hover:from-red-400 hover:to-orange-400'
        }
      },
      supervision: {
        approved: {
          icon: <Award className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
          hoverBg: 'hover:from-green-400 hover:to-emerald-400'
        },
        rejected: {
          icon: <XCircle className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-br from-red-500 to-pink-500',
          hoverBg: 'hover:from-red-400 hover:to-pink-400'
        },
        pending: {
          icon: <Shield className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-500',
          hoverBg: 'hover:from-purple-400 hover:to-indigo-400'
        },
        not_supervised: {
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-br from-gray-500 to-slate-500',
          hoverBg: 'hover:from-gray-400 hover:to-slate-400'
        }
      }
    };

    return configs[type][status] || configs[type].pending;
  };

  const config = getStatusConfig();

  return (
    <div className="relative inline-block">
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-white
          ${config.bgColor} ${config.hoverBg}
          transition-all duration-300 hover:scale-110 cursor-default
          shadow-lg hover:shadow-xl
        `}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {config.icon}
      </div>

      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl px-4 py-3 shadow-2xl border border-gray-700/50 whitespace-nowrap max-w-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
              <span>{tooltip}</span>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
          </div>
        </div>
      )}
    </div>
  );
}