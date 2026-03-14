import React from 'react';

function FieldInput({ label, value, onChange, type = 'number', step, min = 0, name, placeholder }) {
  return (
    <label className="flex flex-col gap-1 text-left">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        inputMode={type === 'number' ? 'decimal' : undefined}
        type={type}
        value={value}
        name={name}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(e) => {
          const val = type === 'number' ? Math.max(0, parseFloat(e.target.value) || 0) : e.target.value;
          onChange(val);
        }}
      />
    </label>
  );
}

export default FieldInput;
