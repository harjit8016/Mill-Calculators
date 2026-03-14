import { useEffect, useMemo, useRef, useState } from 'react';
import { computeBreakeven } from '../lib/calculations.js';
import { saveBreakevenLog, getRecentLogs } from '../lib/firebase.js';
import useAppStore from '../store/useAppStore.js';

const defaults = {
  scrapPrice: 32,
  spongePrice: 28,
  scrapPct: 60,
  powerRate: 7.5,
  unitsPerTonne: 550,
  labourOverhead: 800,
  rollingOther: 600,
  yieldPct: 92,
  product: 'tmt10',
  sellingPrice: 48,
  desiredMargin: 1500,
};

export default function useBreakeven() {
  const userId = useAppStore((s) => s.userId);
  const [inputs, setInputs] = useState(defaults);
  const [recent, setRecent] = useState([]);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef(null);

  const result = useMemo(() => computeBreakeven(inputs), [inputs]);

  useEffect(() => {
    if (!userId) return;
    getRecentLogs('breakeven_logs', userId).then(setRecent);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveBreakevenLog({ userId, ...inputs, ...result });
        setSaved(true);
        setRecent(await getRecentLogs('breakeven_logs', userId));
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('save breakeven error', err);
      }
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [inputs, result.breakevenPerKg, userId]);

  const update = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return { inputs, update, result, recent, saved };
}
