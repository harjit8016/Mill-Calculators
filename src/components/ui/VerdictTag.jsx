import React from 'react';
import clsx from 'clsx';

const tones = {
  good: 'bg-good-bg text-good-text',
  amber: 'bg-amber-bg text-amber-text',
  poor: 'bg-floor-bg text-floor-text',
  neutral: 'bg-gray-100 text-gray-700',
};

function VerdictTag({ tone = 'neutral', label }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold',
        tones[tone] || tones.neutral
      )}
    >
      {label}
    </span>
  );
}

export default VerdictTag;
