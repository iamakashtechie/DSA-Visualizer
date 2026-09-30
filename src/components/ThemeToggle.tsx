import { useThemeStore } from '../store/themeStore';
import { Icon } from './Icon';

type ThemeMode = 'system' | 'light' | 'dark';

const CYCLE: ThemeMode[] = ['system', 'light', 'dark'];
const ICONS: Record<ThemeMode, string> = {
  system: 'brightness_auto',
  light: 'light_mode',
  dark: 'dark_mode',
};
const LABELS: Record<ThemeMode, string> = {
  system: 'Theme: System (click to switch to Light)',
  light: 'Theme: Light (click to switch to Dark)',
  dark: 'Theme: Dark (click to switch to System)',
};

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  function cycle() {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
    setTheme(next);
  }

  return (
    <button
      onClick={cycle}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
      className="flex items-center justify-center w-9 h-9 rounded-lg text-[--text-muted] hover:text-[--text] hover:bg-[--surface-2] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
    >
      <Icon name={ICONS[theme]} size={20} />
    </button>
  );
}
