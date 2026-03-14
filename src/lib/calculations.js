const benchmarks = {
  tmt8: [91, 93],
  tmt10: [92, 94],
  tmt12: [92.5, 94.5],
  tmt16: [93, 95],
  tmt20: [93, 95.5],
  angle: [90, 92],
  flat: [89, 92],
};

export const productOptions = [
  { value: 'tmt8', label: 'TMT 8mm' },
  { value: 'tmt10', label: 'TMT 10mm' },
  { value: 'tmt12', label: 'TMT 12mm' },
  { value: 'tmt16', label: 'TMT 16mm' },
  { value: 'tmt20', label: 'TMT 20mm' },
  { value: 'angle', label: 'Angle/Channel' },
  { value: 'flat', label: 'Flat bar' },
];

const safeDivide = (num, den) => (den ? num / den : 0);

export const computeYield = ({ billetWeight, billetPrice, actualOutput, sellingPrice, product }) => {
  const yieldPct = safeDivide(actualOutput, billetWeight) * 100;
  const lossKg = Math.max(0, billetWeight - actualOutput);
  const lossRs = lossKg * billetPrice;
  const revenue = actualOutput * sellingPrice;
  const [lo, hi] = benchmarks[product] || [0, 0];
  const verdict = (() => {
    const extraKg = Math.max(0, (lo / 100 - safeDivide(actualOutput, billetWeight)) * 1000);
    if (yieldPct >= hi) {
      return {
        tone: 'good',
        label: 'Excellent yield',
        message: `${yieldPct.toFixed(1)}% is above benchmark (${lo}–${hi}%) for ${productLabel(product)}. Well managed shift.`,
        extraKg,
      };
    }
    if (yieldPct >= lo) {
      return {
        tone: 'amber',
        label: 'Average yield',
        message: `${yieldPct.toFixed(1)}% is within benchmark (${lo}–${hi}%) for ${productLabel(product)}. Room to improve.`,
        extraKg,
      };
    }
    return {
      tone: 'poor',
      label: 'Below benchmark',
      message: `${yieldPct.toFixed(1)}% is below benchmark (${lo}–${hi}%). Losing ~${Math.round(extraKg)} kg extra per tonne — ₹${formatInt(extraKg * billetPrice)} per tonne wasted.`,
      extraKg,
    };
  })();

  return {
    yieldPct,
    lossKg,
    lossRs,
    revenue,
    verdict,
    progress: Math.min(yieldPct, 100),
    lo,
    hi,
  };
};

export const computeBreakeven = ({
  scrapPrice,
  spongePrice,
  scrapPct,
  powerRate,
  unitsPerTonne,
  labourOverhead,
  rollingOther,
  yieldPct,
  sellingPrice,
  desiredMargin,
}) => {
  const blendedRaw = scrapPrice * (scrapPct / 100) + spongePrice * ((100 - scrapPct) / 100);
  const rawPerTonne = safeDivide(blendedRaw * 1000, yieldPct / 100);
  const powerPerTonne = powerRate * unitsPerTonne;
  const totalCostPerT = rawPerTonne + powerPerTonne + labourOverhead + rollingOther;
  const breakevenPerKg = safeDivide(totalCostPerT, 1000);
  const revenuePerTonne = sellingPrice * 1000;
  const marginPerTonne = revenuePerTonne - totalCostPerT;
  const marginPct = revenuePerTonne ? (marginPerTonne / revenuePerTonne) * 100 : 0;

  const verdict = (() => {
    if (marginPerTonne > 3000) {
      return {
        tone: 'good',
        label: 'Healthy margin',
        message: `Making ₹${formatInt(marginPerTonne)}/tonne (${marginPct.toFixed(1)}%). ₹${(sellingPrice - breakevenPerKg).toFixed(2)}/kg above breakeven. Safe to roll.`,
      };
    }
    if (marginPerTonne > 500) {
      return {
        tone: 'amber',
        label: 'Thin margin',
        message: `Only ₹${formatInt(marginPerTonne)}/tonne (${marginPct.toFixed(1)}%). A ₹${((sellingPrice - breakevenPerKg) / 2).toFixed(1)}/kg rise in scrap wipes half your profit. Quote at least ₹${((totalCostPerT + 1000) / 1000).toFixed(2)}/kg.`,
      };
    }
    if (marginPerTonne > 0) {
      return {
        tone: 'amber',
        label: 'Near breakeven',
        message: `Barely profitable at ₹${formatInt(marginPerTonne)}/tonne. Do not quote below ₹${((totalCostPerT + 1000) / 1000).toFixed(2)}/kg.`,
      };
    }
    return {
      tone: 'poor',
      label: 'Rolling at a loss',
      message: `Losing ₹${formatInt(Math.abs(marginPerTonne))}/tonne. Raise selling price by ₹${Math.abs(sellingPrice - breakevenPerKg).toFixed(2)}/kg or stop rolling.`,
    };
  })();

  return {
    blendedRaw,
    rawPerTonne,
    powerPerTonne,
    totalCostPerT,
    breakevenPerKg,
    floorPrice: breakevenPerKg,
    safePrice: (totalCostPerT + 1000) / 1000,
    goodPrice: (totalCostPerT + 2000) / 1000,
    customPrice: (totalCostPerT + desiredMargin) / 1000,
    revenuePerTonne,
    marginPerTonne,
    marginPct,
    verdict,
  };
};

export const computePower = ({ powerRate, targetUnitsPerTonne, shifts }) => {
  const processedShifts = shifts.map((s) => {
    const units = s.units || 0;
    const tonnes = s.tonnes || 0;
    const unitsPerTonne = safeDivide(units, tonnes);
    const costPerTonne = unitsPerTonne * powerRate;
    const status = unitsPerTonne > targetUnitsPerTonne * 1.05 ? 'bad' : unitsPerTonne > 0 && unitsPerTonne <= targetUnitsPerTonne ? 'good' : 'warn';
    return { ...s, unitsPerTonne, costPerTonne, status };
  });

  const totalUnits = processedShifts.reduce((sum, s) => sum + (s.units || 0), 0);
  const totalTonnes = processedShifts.reduce((sum, s) => sum + (s.tonnes || 0), 0);
  const avgUnitsPerT = safeDivide(totalUnits, totalTonnes);
  const avgCostPerT = avgUnitsPerT * powerRate;
  const totalBill = totalUnits * powerRate;
  const targetCostPerT = targetUnitsPerTonne * powerRate;
  const extraUnitsPerT = Math.max(0, avgUnitsPerT - targetUnitsPerTonne);
  const extraCostToday = extraUnitsPerT * powerRate * totalTonnes;

  const verdict = (() => {
    if (!avgUnitsPerT) return { tone: 'neutral', label: '—', message: 'Enter shift data above.' };
    if (avgUnitsPerT <= targetUnitsPerTonne) {
      return {
        tone: 'good',
        label: 'On target',
        message: `Avg consumption is ${avgUnitsPerT.toFixed(0)} units/tonne — within your target of ${targetUnitsPerTonne}. Total power bill today: ₹${formatInt(totalBill)}.`,
      };
    }
    if (avgUnitsPerT <= targetUnitsPerTonne * 1.08) {
      return {
        tone: 'amber',
        label: 'Slightly over target',
        message: `Avg is ${avgUnitsPerT.toFixed(0)} units/tonne vs target ${targetUnitsPerTonne}. Extra cost today: ₹${formatInt(extraCostToday)}. Check which shift is driving this.`,
      };
    }
    return {
      tone: 'poor',
      label: 'High consumption',
      message: `Avg is ${avgUnitsPerT.toFixed(0)} units/tonne — ${(avgUnitsPerT - targetUnitsPerTonne).toFixed(0)} units above target. Extra cost today: ₹${formatInt(extraCostToday)}. Investigate furnace efficiency, cobble losses, and idle running time.`,
    };
  })();

  return {
    shifts: processedShifts,
    totalUnits,
    totalTonnes,
    avgUnitsPerT,
    avgCostPerT,
    totalBill,
    targetCostPerT,
    extraUnitsPerT,
    extraCostToday,
    verdict,
  };
};

export const formatInt = (n = 0) =>
  Number.isFinite(n) ? Math.round(n).toLocaleString('en-IN') : '0';

export const formatDecimal = (n = 0, digits = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : '0.00';

export const productLabel = (value) => productOptions.find((p) => p.value === value)?.label || '';
export const benchmarkLookup = benchmarks;
