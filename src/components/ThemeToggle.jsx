import { useEffect, useState } from 'react';

const KEY = 'vc_theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY) || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="btn-ghost text-sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? '切换浅色' : '切换深色'}
    </button>
  );
}
