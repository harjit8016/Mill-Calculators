import { useEffect, useMemo, useRef, useState } from 'react';
import { computePower } from '../lib/calculations.js';
import { savePowerLog, getRecentLogs } from '../lib/firebase.js';
import useAppStore from '../store/useAppStore.js';

const defaults = {
  powerRate: 7.5,
  targetUnitsPerTonne: 520,
  avgTonnesPerShift: 18,
  shifts: [
    { label: 'Morning', units: 9800, tonnes: 19 },
    { label: 'Afternoon', units: 10200, tonnes: 18 },
    { label: 'Night', units: 11100, tonnes: 17 },
  ],
};

export default function usePower() {
  const userId = useAppStore((s) => s.userId);
  const [inputs, setInputs] = useState(defaults);
  const [recent, setRecent] = useState([]);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef(null);

  const result = useMemo(() => computePower(inputs), [inputs]);

  useEffect(() => {
    if (!userId) return;
    getRecentLogs('power_logs', userId).then(setRecent);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await savePowerLog({ userId, ...inputs, ...result });
        setSaved(true);
        setRecent(await getRecentLogs('power_logs', userId));
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('save power error', err);
      }
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [inputs, result.avgUnitsPerT, userId]);

  const updateShift = (index, field, value) => {
    setInputs((prev) => {
      const updated = [...prev.shifts];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, shifts: updated };
    });
  };

  const update = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return { inputs, update, updateShift, result, recent, saved };
}
