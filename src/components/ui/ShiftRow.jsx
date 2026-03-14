import React from 'react';
import clsx from 'clsx';

function ShiftRow({ label, units, tonnes, onUnitsChange, onTonnesChange, costLabel, status }) {
  return (
    <div className="grid grid-cols-4 items-center gap-2 border-b border-gray-100 py-3 px-3 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        className="field-input h-9 text-sm"
        value={units}
        min={0}
        onChange={(e) => onUnitsChange(Math.max(0, parseFloat(e.target.value) || 0))}
      />
      <input
        type="number"
        inputMode="decimal"
        className="field-input h-9 text-sm"
        value={tonnes}
        min={0}
        onChange={(e) => onTonnesChange(Math.max(0, parseFloat(e.target.value) || 0))}
      />
      <span
        className={clsx('text-right font-semibold', {
          'text-green-700': status === 'good',
          'text-red-600': status === 'bad',
          'text-amber-700': status === 'warn',
        })}
      >
        {costLabel}
      </span>
    </div>
  );
}

export default ShiftRow;
