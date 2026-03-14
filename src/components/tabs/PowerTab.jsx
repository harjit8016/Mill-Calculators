import React, { useMemo } from 'react';
import FieldInput from '../ui/FieldInput.jsx';
import MetricCard from '../ui/MetricCard.jsx';
import VerdictTag from '../ui/VerdictTag.jsx';
import ShiftRow from '../ui/ShiftRow.jsx';
import usePower from '../../hooks/usePower.js';
import { formatDecimal, formatInt } from '../../lib/calculations.js';

export default function PowerTab() {
  const { inputs, update, updateShift, result, recent } = usePower();

  const whatsappHigh = useMemo(() => {
    const text = `My rolling mill power consumption is ${formatInt(result.avgUnitsPerT)} units per tonne. Target is ${inputs.targetUnitsPerTonne} units/tonne. What are the common causes of high power consumption and how to fix them?`;
    return `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(text)}`;
  }, [result.avgUnitsPerT, inputs.targetUnitsPerTonne]);

  const whatsappNight = useMemo(() => {
    const text = 'Night shift uses significantly more power per tonne than morning shift in my rolling mill. What operational reasons could cause this and how do I investigate?';
    return `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(text)}`;
  }, []);

  const avgTone = result.avgCostPerT > result.targetCostPerT * 1.05
    ? 'red'
    : result.avgCostPerT > 0 && result.avgCostPerT <= result.targetCostPerT
      ? 'green'
      : 'amber';

  const formatRecentDate = (log) => {
    const d = log?.createdAt?.toDate?.() || (log?.timestamp ? new Date(log.timestamp) : null);
    return d ? d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '';
  };

  const maxShiftUPT = Math.max(
    ...result.shifts.map((s) => s.unitsPerTonne || 0),
    inputs.targetUnitsPerTonne || 1,
    1
  );

  return (
    <div className="screen">
      <div>
        <h1 className="text-[18px] font-semibold text-gray-900">Power cost tracker</h1>
        <p className="text-[12px] text-gray-500 mt-1">Track ₹/tonne across shifts — catch waste before it compounds</p>
      </div>

      <div className="section mt-4">
        <div className="section-label">Power rate & benchmark</div>
        <div className="grid grid-cols-3 gap-2">
          <FieldInput label="₹ per unit (kWh)" value={inputs.powerRate} onChange={(v) => update('powerRate', v)} step="0.1" />
          <FieldInput label="Target units/tonne" value={inputs.targetUnitsPerTonne} onChange={(v) => update('targetUnitsPerTonne', v)} />
          <FieldInput label="Tonnes/shift (avg)" value={inputs.avgTonnesPerShift} onChange={(v) => update('avgTonnesPerShift', v)} />
        </div>
      </div>

      <div className="section">
        <div className="section-label">Shift log — units consumed & tonnes produced</div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid grid-cols-4 gap-2 bg-gray-50 px-3 py-3 text-[12px] font-semibold text-gray-600">
            <span>Shift</span><span>Units (kWh)</span><span>Tonnes</span><span className="text-right">₹/tonne</span>
          </div>
          {result.shifts.map((s, idx) => (
            <ShiftRow
              key={s.label}
              label={s.label}
              units={inputs.shifts[idx].units}
              tonnes={inputs.shifts[idx].tonnes}
              status={s.status}
              costLabel={s.costPerTonne ? `₹${formatInt(s.costPerTonne)}` : '—'}
              onUnitsChange={(val) => updateShift(idx, 'units', val)}
              onTonnesChange={(val) => updateShift(idx, 'tonnes', val)}
            />
          ))}
        </div>
      </div>

      <hr className="divider" />
      <div className="section-label">Today’s summary</div>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Avg units/tonne" value={formatInt(result.avgUnitsPerT)} tone="blue" />
        <MetricCard label="Avg ₹/tonne" value={`₹${formatInt(result.avgCostPerT)}`} tone={avgTone} />
        <MetricCard label="Total units today" value={formatInt(result.totalUnits)} tone="neutral" />
        <MetricCard label="Total power bill" value={`₹${formatInt(result.totalBill)}`} tone="neutral" />
      </div>

      <div className="mt-3">
        <div className="section-label !mb-1">Shift comparison</div>
        <div className="flex flex-col gap-2">
          {result.shifts.map((s) => (
            <div key={s.label} className="grid grid-cols-7 items-center gap-2 text-sm">
              <span className="col-span-2 text-gray-700">{s.label}</span>
              <div className="col-span-4 h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${s.status === 'bad' ? 'bg-red-500' : s.status === 'good' ? 'bg-blue-text' : 'bg-amber-text'}`}
                  style={{ width: `${((s.unitsPerTonne || 0) / maxShiftUPT) * 100}%` }}
                />
              </div>
              <span className="col-span-1 text-right text-gray-700">
                {s.unitsPerTonne ? `${formatInt(s.unitsPerTonne)} u/t` : '—'}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-7 items-center gap-2 text-sm text-gray-500">
            <span className="col-span-2">Target</span>
            <div className="col-span-4 h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full border border-dashed border-gray-400" style={{ width: `${(inputs.targetUnitsPerTonne / maxShiftUPT) * 100}%` }} />
            </div>
            <span className="col-span-1 text-right">{formatInt(inputs.targetUnitsPerTonne)} u/t</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="section-label !mb-1">vs target benchmark</div>
        <div className="progress-bar-bg">
          <div
            className={`progress-bar-fill ${result.avgUnitsPerT > inputs.targetUnitsPerTonne * 1.05 ? 'bg-red-500' : 'bg-blue-text'}`}
            style={{ width: `${Math.min((result.avgUnitsPerT / (inputs.targetUnitsPerTonne || 1)) * 100, 120)}%` }}
          />
        </div>
        <div className="mt-1 text-sm text-gray-700">
          {result.avgUnitsPerT > 0
            ? `${formatInt(result.avgUnitsPerT)} units/tonne vs target ${formatInt(inputs.targetUnitsPerTonne)}`
            : '—'}
        </div>
      </div>

      <div className="verdict-box mt-3">
        <VerdictTag tone={result.verdict.tone === 'poor' ? 'poor' : result.verdict.tone === 'amber' ? 'amber' : 'good'} label={result.verdict.label} />
        <p className="mt-2 text-[13px] leading-snug">{result.verdict.message}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricCard label="Extra units wasted" value={formatInt(result.extraUnitsPerT * result.totalTonnes)} tone="amber" />
        <MetricCard label="Extra cost today" value={`₹${formatInt(result.extraCostToday)}`} tone="amber" />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <button className="w-full rounded-lg bg-blue-text px-4 py-3 text-white text-sm font-semibold" onClick={() => window.open(whatsappHigh, '_blank')}>
          Why is my power consumption high →
        </button>
        <button className="w-full rounded-lg bg-blue-text px-4 py-3 text-white text-sm font-semibold" onClick={() => window.open(whatsappNight, '_blank')}>
          Night shift uses more power — why →
        </button>
      </div>

      <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700">Recent logs</summary>
        <div className="mt-2 flex flex-col gap-2">
          {recent && recent.length === 0 && <p className="text-[12px] text-gray-500">No logs yet.</p>}
          {recent?.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
              <span className="text-gray-500">{formatRecentDate(log)}</span>
              <span className="text-gray-800">Avg {formatInt(log.avgUnitsPerT || 0)} u/t</span>
              <span className="font-semibold text-red-600">₹{formatInt(log.totalBill || 0)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
