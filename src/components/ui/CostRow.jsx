import React from 'react';

function CostRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-3 py-3 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default CostRow;
