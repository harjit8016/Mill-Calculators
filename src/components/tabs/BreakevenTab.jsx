import React, { useMemo } from 'react';
import FieldInput from '../ui/FieldInput.jsx';
import MetricCard from '../ui/MetricCard.jsx';
import VerdictTag from '../ui/VerdictTag.jsx';
import CostRow from '../ui/CostRow.jsx';
import { productOptions, formatDecimal, formatInt } from '../../lib/calculations.js';
import useBreakeven from '../../hooks/useBreakeven.js';

const fmtPercent = (n) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '0.0';

export default function BreakevenTab() {
  const { inputs, update, result, recent } = useBreakeven();

  const whatsappReduceCost = useMemo(() => {
    const text = `My TMT breakeven is ₹${formatDecimal(result.breakevenPerKg || 0)}/kg and safe price is ₹${formatDecimal(result.safePrice || 0)}/kg. How can I reduce cost per tonne?`;
    return `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(text)}`;
  }, [result.breakevenPerKg, result.safePrice]);

  const whatsappScrapRise = useMemo(() => {
    const text = `Scrap price just increased ₹2/kg. Breakeven was ₹${formatDecimal(result.breakevenPerKg || 0)}/kg. New minimum selling price?`;
    return `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(text)}`;
  }, [result.breakevenPerKg]);

  const maxBar = Math.max(result.totalCostPerT || 1, result.revenuePerTonne || 1);
  const costWidth = ((result.totalCostPerT || 0) / maxBar) * 100;
  const sellWidth = ((result.revenuePerTonne || 0) / maxBar) * 100;

  const marginTone = result.marginPerTonne > 2000 ? 'green' : result.marginPerTonne > 0 ? 'amber' : 'red';
  const marginPctTone = result.marginPct > 5 ? 'green' : result.marginPct > 0 ? 'amber' : 'red';

  const formatRecentDate = (log) => {
    const d = log?.createdAt?.toDate?.() || (log?.timestamp ? new Date(log.timestamp) : null);
    return d ? d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '';
  };

  return (
    <div className="screen">
      <div>
        <h1 className="text-[18px] font-semibold text-gray-900">Scrap to TMT — breakeven</h1>
        <p className="text-[12px] text-gray-500 mt-1">Know your floor price before you quote</p>
      </div>

      <div className="section mt-4">
        <div className="section-label">Raw material</div>
        <div className="grid grid-cols-3 gap-2">
          <FieldInput label="Scrap (₹/kg)" value={inputs.scrapPrice} onChange={(v) => update('scrapPrice', v)} />
          <FieldInput label="Sponge iron (₹/kg)" value={inputs.spongePrice} onChange={(v) => update('spongePrice', v)} />
          <FieldInput label="Scrap % in mix" value={inputs.scrapPct} onChange={(v) => update('scrapPct', v)} />
        </div>
      </div>

      <div className="section">
        <div className="section-label">Production costs (per tonne)</div>
        <div className="grid grid-cols-2 gap-2">
          <FieldInput label="Power rate (₹/unit)" value={inputs.powerRate} onChange={(v) => update('powerRate', v)} step="0.1" />
          <FieldInput label="Units per tonne" value={inputs.unitsPerTonne} onChange={(v) => update('unitsPerTonne', v)} />
          <FieldInput label="Labour + overhead (₹/t)" value={inputs.labourOverhead} onChange={(v) => update('labourOverhead', v)} />
          <FieldInput label="Rolling + other (₹/t)" value={inputs.rollingOther} onChange={(v) => update('rollingOther', v)} />
        </div>
      </div>

      <div className="section">
        <div className="section-label">Yield & selling price</div>
        <div className="grid grid-cols-3 gap-2">
          <FieldInput label="Yield (%)" value={inputs.yieldPct} onChange={(v) => update('yieldPct', v)} step="0.1" />
          <label className="flex flex-col gap-1 text-left">
            <span className="field-label">Product</span>
            <select
              className="field-select"
              value={inputs.product}
              onChange={(e) => update('product', e.target.value)}
            >
              {productOptions
                .filter((p) => ['tmt10', 'tmt12', 'tmt16', 'angle', 'flat'].includes(p.value))
                .map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
            </select>
          </label>
          <FieldInput label="Selling price (₹/kg)" value={inputs.sellingPrice} onChange={(v) => update('sellingPrice', v)} />
        </div>
      </div>

      <hr className="divider" />

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="text-[12px] font-semibold text-gray-700 mb-2">Minimum price to quote</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-floor-bg px-3 py-2 text-floor-text">
            <div className="text-[11px] font-medium">Floor</div>
            <div className="text-xl font-bold">₹{formatDecimal(result.floorPrice)}</div>
            <div className="text-[11px]">break even</div>
          </div>
          <div className="rounded-lg bg-amber-bg px-3 py-2 text-amber-text">
            <div className="text-[11px] font-medium">Safe</div>
            <div className="text-xl font-bold">₹{formatDecimal(result.safePrice)}</div>
            <div className="text-[11px]">₹1k/t margin</div>
          </div>
          <div className="rounded-lg bg-good-bg px-3 py-2 text-good-text sm:col-span-1 col-span-2">
            <div className="text-[11px] font-medium">Good</div>
            <div className="text-xl font-bold">₹{formatDecimal(result.goodPrice)}</div>
            <div className="text-[11px]">₹2k/t margin</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span>I want ₹</span>
          <input
            type="number"
            inputMode="decimal"
            className="field-input h-9 w-24"
            value={inputs.desiredMargin}
            onChange={(e) => update('desiredMargin', Math.max(0, parseFloat(e.target.value) || 0))}
          />
          <span>/tonne → quote</span>
          <div className="ml-auto font-semibold">₹{formatDecimal(result.customPrice)}/kg</div>
        </div>
      </div>

      <div className="section mt-4">
        <div className="section-label">Cost breakdown per tonne</div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <CostRow label="Raw material (yield adjusted)" value={`₹${formatInt(result.rawPerTonne)}`} />
          <CostRow label="Power cost" value={`₹${formatInt(result.powerPerTonne)}`} />
          <CostRow label="Labour + overhead" value={`₹${formatInt(inputs.labourOverhead)}`} />
          <CostRow label="Rolling + other" value={`₹${formatInt(inputs.rollingOther)}`} />
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 font-semibold">
            <span>Total cost per tonne</span>
            <span>₹{formatInt(result.totalCostPerT)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Breakeven price" value={`₹${formatDecimal(result.breakevenPerKg)}`} unit="/kg" tone="blue" />
        <MetricCard label="Margin/tonne" value={`₹${formatInt(result.marginPerTonne)}`} tone={marginTone} />
        <MetricCard label="Revenue/tonne" value={`₹${formatInt(result.revenuePerTonne)}`} tone="neutral" />
        <MetricCard label="Margin %" value={fmtPercent(result.marginPct)} unit="%" tone={marginPctTone} />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>Cost vs selling price</span>
          <span className="text-gray-600">
            Cost ₹{formatInt(result.totalCostPerT)} / Sell ₹{formatInt(result.revenuePerTonne)}
          </span>
        </div>
        <div className="cost-bar-bg mt-1">
          <div className="cost-bar-fill bg-green-600 opacity-70" style={{ width: `${sellWidth.toFixed(1)}%` }} />
          <div className="cost-bar-fill bg-red-500" style={{ width: `${costWidth.toFixed(1)}%` }} />
        </div>
        <div className="mt-1 flex items-center gap-3 text-[12px] text-gray-600">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Total cost</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-600 opacity-70" /> Selling price</span>
        </div>
      </div>

      <div className="verdict-box mt-3">
        <VerdictTag tone={result.verdict.tone === 'poor' ? 'poor' : result.verdict.tone === 'amber' ? 'amber' : 'good'} label={result.verdict.label} />
        <p className="mt-2 text-[13px] leading-snug">{result.verdict.message}</p>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <button
          className="w-full rounded-lg bg-blue-text px-4 py-3 text-white text-sm font-semibold"
          onClick={() => window.open(whatsappReduceCost, '_blank')}
        >
          How to reduce cost per tonne →
        </button>
        <button
          className="w-full rounded-lg bg-blue-text px-4 py-3 text-white text-sm font-semibold"
          onClick={() => window.open(whatsappScrapRise, '_blank')}
        >
          Scrap price went up — what now →
        </button>
      </div>

      <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700">Recent calculations</summary>
        <div className="mt-2 flex flex-col gap-2">
          {recent && recent.length === 0 && <p className="text-[12px] text-gray-500">No logs yet.</p>}
          {recent?.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
              <span className="text-gray-500">{formatRecentDate(log)}</span>
              <span className="text-gray-800">₹{formatDecimal(log.breakevenPerKg || 0)}/kg</span>
              <span className="font-semibold text-green-700">₹{formatInt(log.marginPerTonne || 0)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
