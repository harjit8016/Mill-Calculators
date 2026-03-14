import { useEffect, useMemo, useRef, useState } from 'react';
import { computeYield } from '../lib/calculations.js';
import { saveYieldLog, getRecentLogs } from '../lib/firebase.js';
import useAppStore from '../store/useAppStore.js';

const defaults = {
  billetWeight: 5000,
  billetPrice: 42,
  product: 'tmt10',
  actualOutput: 4550,
  sellingPrice: 48,
};

export default function useYield() {
  const userId = useAppStore((s) => s.userId);
  const [inputs, setInputs] = useState(defaults);
  const [recent, setRecent] = useState([]);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef(null);

  const result = useMemo(() => computeYield(inputs), [inputs]);

  // initial recent fetch
  useEffect(() => {
    if (!userId) return;
    getRecentLogs('yield_logs', userId).then(setRecent);
  }, [userId]);

  // autosave after debounce
  useEffect(() => {
    if (!userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveYieldLog({ userId, ...inputs, ...result });
        setSaved(true);
        setRecent(await getRecentLogs('yield_logs', userId));
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('save yield error', err);
      }
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [inputs, result.yieldPct, userId]);

  const update = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return { inputs, update, result, recent, saved };
}
