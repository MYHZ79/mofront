import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Goal } from '../types/api';

interface GoalStatusDisplayProps {
  goal: Goal;
}

export function GoalStatusDisplay({ goal }: GoalStatusDisplayProps) {
  const now = new Date().getTime() / 1000;
  const deadline = goal.deadline;
  const isSupervised = goal.supervised_at !== undefined && goal.supervised_at !== null;
  const isExpired = deadline && deadline < now;

  // Determine deadline status
  let deadlineStatus: 'active' | 'completed' | 'expired';
  let deadlineTooltip: string;

  if (isSupervised) {
    deadlineStatus = 'completed';
    deadlineTooltip = `فرآیند در تاریخ ${goal.supervised_at ? new Date(goal.supervised_at * 1000).toLocaleDateString('fa-IR') : ''} تکمیل شد`;
  } else if (isExpired) {
    deadlineStatus = 'expired';
    deadlineTooltip = `مهلت در تاریخ ${deadline ? new Date(deadline * 1000).toLocaleDateString('fa-IR') : ''} به پایان رسید`;
  } else {
    deadlineStatus = 'active';
    const remainingDays = deadline ? Math.ceil((deadline - now) / (24 * 60 * 60)) : 0;
    deadlineTooltip = remainingDays > 0 ? `${remainingDays} روز تا پایان مهلت` : 'کمتر از یک روز تا پایان مهلت';
  }

  // Determine supervision status
  let supervisionStatus: 'approved' | 'rejected' | 'pending' | 'not_supervised' | null = null;
  let supervisionTooltip: string = '';

  if (isSupervised) {
    if (goal.done) {
      supervisionStatus = 'approved';
      supervisionTooltip = 'ناظر انجام هدف را تایید کرده است';
      if (goal.supervisor_description) {
        supervisionTooltip += ` - ${goal.supervisor_description}`;
      }
    } else {
      supervisionStatus = 'rejected';
      supervisionTooltip = 'ناظر انجام هدف را رد کرده است';
      if (goal.supervisor_description) {
        supervisionTooltip += ` - ${goal.supervisor_description}`;
      }
    }
  } else if (isExpired) {
    supervisionStatus = 'not_supervised';
    supervisionTooltip = 'مهلت به پایان رسیده و هدف نظارت نشده است';
  }

  return (
    <div className="flex items-center gap-2">
      <StatusBadge
        type="deadline"
        status={deadlineStatus}
        tooltip={deadlineTooltip}
      />
      
      {supervisionStatus && (
        <StatusBadge
          type="supervision"
          status={supervisionStatus}
          tooltip={supervisionTooltip}
        />
      )}
    </div>
  );
}

// Helper function to get row background class
export function getRowBackgroundClass(goal: Goal): string {
  const now = new Date().getTime() / 1000;
  const deadline = goal.deadline;
  const isSupervised = goal.supervised_at !== undefined && goal.supervised_at !== null;
  const isExpired = deadline && deadline < now;

  if (isSupervised) {
    if (goal.done) {
      return 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20';
    } else {
      return 'bg-red-500/5 hover:bg-red-500/10 border-red-500/20';
    }
  } else if (isExpired) {
    return 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20';
  } else {
    return 'bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20';
  }
}

// Helper function to get priority for sorting
export function getGoalPriority(goal: Goal): number {
  const now = new Date().getTime() / 1000;
  const deadline = goal.deadline;
  const isSupervised = goal.supervised_at !== undefined && goal.supervised_at !== null;
  const isExpired = deadline && deadline < now;

  // Priority order: active (in progress) > expired > completed
  if (!isSupervised && !isExpired) {
    return 1; // Active/In progress - highest priority
  } else if (isExpired && !isSupervised) {
    return 2; // Expired but not supervised
  } else {
    return 3; // Completed (supervised) - lowest priority
  }
}