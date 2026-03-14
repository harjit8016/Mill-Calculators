import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import YieldTab from './components/tabs/YieldTab.jsx';
import BreakevenTab from './components/tabs/BreakevenTab.jsx';
import PowerTab from './components/tabs/PowerTab.jsx';
import ServicesTab from './components/tabs/ServicesTab.jsx';
import { ensureAnonymousUser, watchAuth } from './lib/firebase.js';
import useAppStore from './store/useAppStore.js';

const tabs = [
  { key: 'yield', path: '/', label: 'Yield', icon: 'yield' },
  { key: 'breakeven', path: '/breakeven', label: 'Breakeven', icon: 'target' },
  { key: 'power', path: '/power', label: 'Power', icon: 'bolt' },
  { key: 'services', path: '/services', label: 'Services', icon: 'briefcase' },
];

function TabIcon({ type, active }) {
  const stroke = active ? '#185FA5' : '#9ca3af';
  switch (type) {
    case 'yield':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19V5" />
          <rect x="7" y="10" width="3" height="9" rx="1" />
          <rect x="12" y="7" width="3" height="12" rx="1" />
          <rect x="17" y="4" width="3" height="15" rx="1" />
        </svg>
      );
    case 'target':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <text x="12" y="14" textAnchor="middle" fontSize="6" fill={stroke}>₹</text>
        </svg>
      );
    case 'bolt':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill={stroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 11 14 11 22 21 10 13 10 13 2" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg className="h-5 w-5" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="7" width="16" height="12" rx="2" stroke={stroke} strokeWidth="1.3" fill="none" />
          <path d="M8 7V5a3 3 0 016 0v2" stroke={stroke} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <line x1="3" y1="12" x2="19" y2="12" stroke={stroke} strokeWidth="1.3" />
        </svg>
      );
    default:
      return null;
  }
}

function OfflineToast({ offline }) {
  if (!offline) return null;
  return (
    <div className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-full bg-amber-bg px-4 py-2 text-xs font-semibold text-amber-text">
      You are offline — values will stay cached
    </div>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAppStore((s) => s.setUser);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const unsub = watchAuth((user) => {
      if (user) setUser(user);
    });
    ensureAnonymousUser().then(setUser).catch(console.error);
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      unsub && unsub();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setUser]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const activeKey = tabs.find((t) => t.path === location.pathname)?.key || 'yield';

  return (
    <div className="app-shell">
      <OfflineToast offline={offline} />
      <Routes>
        <Route path="/" element={<YieldTab />} />
        <Route path="/breakeven" element={<BreakevenTab />} />
        <Route path="/power" element={<PowerTab />} />
        <Route path="/services" element={<ServicesTab />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <nav className="tab-bar">
        {tabs.map((tab) => {
          const active = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              className={`tab-button ${active ? 'tab-button-active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <TabIcon type={tab.icon} active={active} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default AppShell;
