import React, { useMemo } from 'react';
import MetricCard from '../ui/MetricCard.jsx';
import FieldInput from '../ui/FieldInput.jsx';
import VerdictTag from '../ui/VerdictTag.jsx';
import { productOptions, productLabel, formatDecimal, formatInt } from '../../lib/calculations.js';
import useYield from '../../hooks/useYield.js';
import { signInWithGoogle } from '../../lib/firebase.js';

const fmtPercent = (n) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '0.0';

export default function YieldTab() {
  const { inputs, update, result, recent, saved } = useYield();

  const whatsappLink = useMemo(() => {
    const text = `My billet to bar yield is ${fmtPercent(result.yieldPct)}% on ${productLabel(inputs.product)}. How can I improve it?`;
    return `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(text)}`;
  }, [inputs.product, result.yieldPct]);

  const barLabel = result.yieldPct
    ? `${fmtPercent(result.yieldPct)}% becomes bar`
    : '—';

  const formatRecentDate = (log) => {
    const d = log?.createdAt?.toDate?.() || (log?.timestamp ? new Date(log.timestamp) : null);
    return d ? d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '';
  };

  return (
    <div className="screen">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-gray-900">Billet to bar — yield calculator</h1>
          <p className="text-[12px] text-gray-500 mt-1">Track yield loss and its cost per shift</p>
        </div>
        <div className="text-right text-[12px] text-blue-text">
          <button
            className="underline"
            onClick={() => {
              signInWithGoogle().catch((e) => console.error('google sign-in', e));
            }}
          >
            Save data across devices? Sign in with Google
          </button>
          {saved && (
            <div className="saved-toast mt-1">
              <span className="toast-dot" /> Saved
            </div>
          )}
        </div>
      </div>

      <div className="section mt-4">
        <div className="section-label">Billet input</div>
        <div className="grid grid-cols-2 gap-2">
          <FieldInput
            label="Billet weight (kg)"
            value={inputs.billetWeight}
            onChange={(v) => update('billetWeight', v)}
          />
          <FieldInput
            label="Billet price (₹/kg)"
            value={inputs.billetPrice}
            onChange={(v) => update('billetPrice', v)}
            step="0.1"
          />
        </div>
      </div>

      <div className="section">
        <div className="section-label">Finished bar output</div>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1 text-left">
            <span className="field-label">Product</span>
            <select
              className="field-select"
              value={inputs.product}
              onChange={(e) => update('product', e.target.value)}
            >
              {productOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <FieldInput
            label="Actual output (kg)"
            value={inputs.actualOutput}
            onChange={(v) => update('actualOutput', v)}
          />
          <FieldInput
            label="Selling price (₹/kg)"
            value={inputs.sellingPrice}
            onChange={(v) => update('sellingPrice', v)}
            step="0.1"
          />
        </div>
      </div>

      <hr className="divider" />
      <div className="section-label">Results — this shift</div>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Yield" value={fmtPercent(result.yieldPct)} unit="%" tone="blue" />
        <MetricCard label="Loss (kg)" value={`${formatInt(result.lossKg)} kg`} tone="red" />
        <MetricCard label="Loss in ₹" value={`₹${formatInt(result.lossRs)}`} tone="red" />
        <MetricCard label="Revenue" value={`₹${formatInt(result.revenue)}`} tone="green" />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>Yield</span>
          <span className="text-gray-600">{barLabel}</span>
        </div>
        <div className="progress-bar-bg mt-1">
          <div
            className="progress-bar-fill"
            style={{ width: `${result.progress || 0}%` }}
          />
        </div>
      </div>

      <div className="verdict-box mt-3">
        <VerdictTag tone={result.verdict.tone} label={result.verdict.label} />
        <p className="mt-2 text-[13px] leading-snug">{result.verdict.message}</p>
      </div>

      <button
        className="mt-3 w-full rounded-lg bg-blue-text px-4 py-3 text-white text-sm font-semibold"
        onClick={() => window.open(whatsappLink, '_blank')}
      >
        How to improve yield →
      </button>

      <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700">Recent shifts</summary>
        <div className="mt-2 flex flex-col gap-2">
          {recent && recent.length === 0 && <p className="text-[12px] text-gray-500">No logs yet.</p>}
          {recent?.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
              <span className="text-gray-500">{formatRecentDate(log)}</span>
              <span className="text-gray-800">{productLabel(log.product)}</span>
              <span className="font-semibold text-blue-text">{fmtPercent(log.yieldPct || 0)}%</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
