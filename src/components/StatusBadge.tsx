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
  text: string;
  tooltip?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ type, status, text, tooltip, size = 'sm' }: StatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusConfig = () => {
    const configs = {
      deadline: {
        active: {
          icon: <Timer className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          bgColor: 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15',
          borderColor: 'border-blue-400/40',
          textColor: 'text-blue-300',
          iconBg: 'bg-blue-500/25',
          glowColor: 'shadow-blue-500/20'
        },
        completed: {
          icon: <Star className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          bgColor: 'bg-gradient-to-r from-emerald-500/15 to-green-500/15',
          borderColor: 'border-emerald-400/40',
          textColor: 'text-emerald-300',
          iconBg: 'bg-emerald-500/25',
          glowColor: 'shadow-emerald-500/20'
        },
        expired: {
          icon: <Hourglass className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          bgColor: 'bg-gradient-to-r from-red-500/15 to-orange-500/15',
          borderColor: 'border-red-400/40',
          textColor: 'text-red-300',
          iconBg: 'bg-red-500/25',
          glowColor: 'shadow-red-500/20'
        },
        pending: {
          icon: <Clock className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          bgColor: 'bg-gradient-to-r from-amber-500/15 to-yellow-500/15',
          borderColor: 'border-amber-400/40',
          textColor: 'text-amber-300',
          iconBg: 'bg-amber-500/25',
          glowColor: 'shadow-amber-500/20'
        }
      },
      supervision: {
        approved: {
          icon: <Award className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          bgColor: 'bg-gradient-to-r from-green-500/15 to-emerald-500/15',
          borderColor: 'border-green-400/40',
          textColor: 'text-green-300',
          iconBg: 'bg-green-500/25',
          glowColor: 'shadow-green-500/20'
        },
        rejected: {
          icon: <XCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          bgColor: 'bg-gradient-to-r from-red-500/15 to-pink-500/15',
          borderColor: 'border-red-400/40',
          textColor: 'text-red-300',
          iconBg: 'bg-red-500/25',
          glowColor: 'shadow-red-500/20'
        },
        pending: {
          icon: <Shield className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          bgColor: 'bg-gradient-to-r from-purple-500/15 to-indigo-500/15',
          borderColor: 'border-purple-400/40',
          textColor: 'text-purple-300',
          iconBg: 'bg-purple-500/25',
          glowColor: 'shadow-purple-500/20'
        },
        not_supervised: {
          icon: <AlertCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          bgColor: 'bg-gradient-to-r from-gray-500/15 to-slate-500/15',
          borderColor: 'border-gray-400/40',
          textColor: 'text-gray-300',
          iconBg: 'bg-gray-500/25',
          glowColor: 'shadow-gray-500/20'
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
          inline-flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-sm
          ${config.bgColor} ${config.borderColor} ${config.textColor} ${config.glowColor}
          transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default
          ${size === 'sm' ? 'text-xs' : 'text-sm'}
          shadow-sm
        `}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={`p-1.5 rounded-full ${config.iconBg} transition-all duration-300`}>
          {config.icon}
        </div>
        <span className="font-semibold whitespace-nowrap tracking-wide">{text}</span>
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