import React from 'react';
import clsx from 'clsx';

const toneClasses = {
  blue: 'bg-blue-bg text-blue-text',
  green: 'bg-good-bg text-good-text',
  red: 'bg-floor-bg text-floor-text',
  amber: 'bg-amber-bg text-amber-text',
  safe: 'bg-safe-bg text-safe-text',
  neutral: 'bg-gray-100 text-gray-800',
};

function MetricCard({ label, value, unit, tone = 'neutral' }) {
  return (
    <div className={clsx('rounded-lg px-3 py-2', toneClasses[tone] || toneClasses.neutral)}>
      <div className="text-[11px] font-medium opacity-80">{label}</div>
      <div className="text-[20px] font-bold leading-tight mt-1">
        {value}
        {unit ? <span className="text-[12px] font-medium ml-1">{unit}</span> : null}
      </div>
    </div>
  );
}

export default MetricCard;
