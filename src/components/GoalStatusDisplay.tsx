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
  let deadlineText: string;
  let deadlineTooltip: string;

  if (isSupervised) {
    deadlineStatus = 'completed';
    deadlineText = 'تکمیل شده';
    deadlineTooltip = `فرآیند در تاریخ ${goal.supervised_at ? new Date(goal.supervised_at * 1000).toLocaleDateString('fa-IR') : ''} تکمیل شد`;
  } else if (isExpired) {
    deadlineStatus = 'expired';
    deadlineText = 'منقضی شده';
    deadlineTooltip = `مهلت در تاریخ ${deadline ? new Date(deadline * 1000).toLocaleDateString('fa-IR') : ''} به پایان رسید`;
  } else {
    deadlineStatus = 'active';
    deadlineText = 'فعال';
    const remainingDays = deadline ? Math.ceil((deadline - now) / (24 * 60 * 60)) : 0;
    deadlineTooltip = remainingDays > 0 ? `${remainingDays} روز تا پایان مهلت` : 'کمتر از یک روز تا پایان مهلت';
  }

  // Determine supervision status
  let supervisionStatus: 'approved' | 'rejected' | 'pending' | 'not_supervised' | null = null;
  let supervisionText: string = '';
  let supervisionTooltip: string = '';

  if (isSupervised) {
    if (goal.done) {
      supervisionStatus = 'approved';
      supervisionText = 'تایید شده';
      supervisionTooltip = 'ناظر انجام هدف را تایید کرده است';
      if (goal.supervisor_description) {
        supervisionTooltip += ` - ${goal.supervisor_description}`;
      }
    } else {
      supervisionStatus = 'rejected';
      supervisionText = 'رد شده';
      supervisionTooltip = 'ناظر انجام هدف را رد کرده است';
      if (goal.supervisor_description) {
        supervisionTooltip += ` - ${goal.supervisor_description}`;
      }
    }
  } else if (isExpired) {
    supervisionStatus = 'not_supervised';
    supervisionText = 'نظارت نشده';
    supervisionTooltip = 'مهلت به پایان رسیده و هدف نظارت نشده است';
  }

  return (
    <div className="flex flex-col gap-2.5">
      <StatusBadge
        type="deadline"
        status={deadlineStatus}
        text={deadlineText}
        tooltip={deadlineTooltip}
      />
      
      {supervisionStatus && (
        <StatusBadge
          type="supervision"
          status={supervisionStatus}
          text={supervisionText}
          tooltip={supervisionTooltip}
        />
      )}
    </div>
  );
}