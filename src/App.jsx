import { useEffect, useMemo, useRef, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { roscoFilters } from './data/roscoFilters.js';
import { languages, translations } from './i18n.js';

const KELVIN_MIN = 2000;
const KELVIN_MAX = 10000;
const LANGUAGE_STORAGE_KEY = 'rosco-filter-advisor-language';
const THEME_STORAGE_KEY = 'rosco-filter-advisor-theme';
const themes = [
  { id: 'daylight', labelKey: 'themeDaylight', swatches: ['#f7f8fb', '#ffffff', '#156f86'] },
  { id: 'studio', labelKey: 'themeStudio', swatches: ['#f8f5f0', '#ffffff', '#a35b1d'] },
  { id: 'cyan', labelKey: 'themeCyan', swatches: ['#f3fafb', '#ffffff', '#0f7d8a'] },
  { id: 'darkroom', labelKey: 'themeDarkroom', swatches: ['#111820', '#1b2630', '#5ebbd0'] },
];

function App() {
  const [language, setLanguage] = useState(getStoredLanguage);
  const [themeId, setThemeId] = useState(getStoredTheme);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [originalKelvin, setOriginalKelvin] = useState(5500);
  const [convertedKelvin, setConvertedKelvin] = useState(3200);
  const [allowStacking, setAllowStacking] = useState(false);
  const isStandalonePWA = useStandalonePWA();
  const t = translations[language];
  const originalMired = kelvinToMired(originalKelvin);
  const convertedMired = kelvinToMired(convertedKelvin);
  const miredShift = convertedMired - originalMired;
  const recommendations = useMemo(() => findRoscoRecommendations(miredShift, allowStacking), [miredShift, allowStacking]);

  useEffect(() => {
    document.documentElement.lang = language;
    saveStoredValue(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    saveStoredValue(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  if (isSettingsOpen) {
    return (
      <SettingsView
        language={language}
        setLanguage={setLanguage}
        themeId={themeId}
        setThemeId={setThemeId}
        isStandalonePWA={isStandalonePWA}
        t={t}
        onBack={() => setSettingsOpen(false)}
      />
    );
  }

  return (
    <main className="app-shell" data-theme={themeId} data-display-mode={isStandalonePWA ? 'standalone' : 'browser'}>
      <section className="rosco-layout">
        <header className="topbar">
          <div>
            <p className="eyebrow">{t.appEyebrow}</p>
            <h1>{t.appTitle}</h1>
          </div>
          <button type="button" className="icon-button" aria-label={t.openSettings} onClick={() => setSettingsOpen(true)}>
            <GearIcon />
          </button>
        </header>

        <section className="calculator-panel" aria-label={t.calculatorLabel}>
          <div className="calculator-meta-row">
            <div className="conversion-summary" aria-label={t.conversionSummary}>
              <span>{t.conversionSummary}</span>
              <strong>{originalKelvin.toLocaleString()}K{' -> '}{convertedKelvin.toLocaleString()}K</strong>
              <small>{formatMiredValue(originalMired)}{' -> '}{formatMiredValue(convertedMired)} Mired</small>
            </div>
            <div className="shift-readout" aria-label={t.miredShift}>
              <span>{t.miredShift}</span>
              <strong>{formatMiredShift(miredShift)}</strong>
            </div>
          </div>
          <div className="slider-stack">
            <SourceSlider label={t.originalSource} minLabel={t.kelvinMin} maxLabel={t.kelvinMax} value={originalKelvin} onChange={setOriginalKelvin} />
            <SourceSlider label={t.convertedSource} minLabel={t.kelvinMin} maxLabel={t.kelvinMax} value={convertedKelvin} onChange={setConvertedKelvin} />
          </div>
        </section>

        <section className="recommendations-block">
          <div className="recommendation-tools" aria-label={t.recommendationSettings}>
            <label className="stack-toggle">
              <input type="checkbox" checked={allowStacking} onChange={(event) => setAllowStacking(event.target.checked)} />
              <span>{t.allowStacking}</span>
            </label>
          </div>

          <div className="recommendation-grid">
            <RecommendationGroup title={t.nearestAbove} recommendation={recommendations.above} t={t} />
            <RecommendationGroup title={t.nearestBelow} recommendation={recommendations.below} t={t} />
          </div>
        </section>
      </section>
      <PWAInstallPrompt />
    </main>
  );
}

function PWAInstallPrompt() {
  const installRef = useRef(null);

  useEffect(() => {
    if (installRef.current) {
      installRef.current.styles = { '--tint-color': '#156f86' };
    }
  }, []);

  return (
    <pwa-install
      ref={installRef}
      use-local-storage
      manifest-url={`${import.meta.env.BASE_URL}manifest.webmanifest`}
    ></pwa-install>
  );
}

function SettingsView({ language, setLanguage, themeId, setThemeId, isStandalonePWA, t, onBack }) {
  return (
    <main className="app-shell" data-theme={themeId} data-display-mode={isStandalonePWA ? 'standalone' : 'browser'}>
      <section className="rosco-layout settings-layout">
        <header className="topbar">
          <div>
            <p className="eyebrow">{t.settingsEyebrow}</p>
            <h1>{t.settingsTitle}</h1>
          </div>
          <button type="button" className="back-button" onClick={onBack}>
            <BackIcon />
            <span>{t.backToCalculator}</span>
          </button>
        </header>

        <section className="settings-panel" aria-label={t.settingsTitle}>
          <div className="settings-row">
            <div className="settings-copy">
              <h2>{t.languageLabel}</h2>
            </div>
            <LanguageSelector language={language} setLanguage={setLanguage} label={t.languageLabel} />
          </div>
          <div className="settings-row">
            <div className="settings-copy">
              <h2>{t.themeLabel}</h2>
            </div>
            <ThemeSelector themeId={themeId} setThemeId={setThemeId} t={t} />
          </div>
        </section>
      </section>
    </main>
  );
}

function useStandalonePWA() {
  const [isStandalone, setStandalone] = useState(getStandalonePWAStatus);

  useEffect(() => {
    const queries = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: fullscreen)'),
      window.matchMedia('(display-mode: minimal-ui)'),
    ];
    const updateStatus = () => setStandalone(getStandalonePWAStatus());

    queries.forEach((query) => query.addEventListener('change', updateStatus));
    window.addEventListener('pageshow', updateStatus);
    updateStatus();

    return () => {
      queries.forEach((query) => query.removeEventListener('change', updateStatus));
      window.removeEventListener('pageshow', updateStatus);
    };
  }, []);

  return isStandalone;
}

function LanguageSelector({ language, setLanguage, label }) {
  const [isOpen, setOpen] = useState(false);
  const currentLanguage = languages.find((item) => item.code === language) ?? languages[0];

  return (
    <div
      className="language-selector"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <span>{label}</span>
      <button
        type="button"
        className="language-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpen((open) => !open)}
      >
        <span>{currentLanguage.label}</span>
        <span className="selector-arrow" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="language-menu" role="listbox" aria-label={label}>
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={item.code === language}
              className={item.code === language ? 'active' : ''}
              onClick={() => {
                setLanguage(item.code);
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ThemeSelector({ themeId, setThemeId, t }) {
  return (
    <div className="theme-selector" role="radiogroup" aria-label={t.themeLabel}>
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          role="radio"
          aria-checked={theme.id === themeId}
          className={theme.id === themeId ? 'theme-option active' : 'theme-option'}
          onClick={() => setThemeId(theme.id)}
        >
          <span className="theme-swatches" aria-hidden="true">
            {theme.swatches.map((color) => (
              <span key={color} style={{ backgroundColor: color }} />
            ))}
          </span>
          <span>{t[theme.labelKey]}</span>
        </button>
      ))}
    </div>
  );
}

function SourceSlider({ label, minLabel, maxLabel, value, onChange }) {
  const progress = ((value - KELVIN_MIN) / (KELVIN_MAX - KELVIN_MIN)) * 100;
  const sliderStyle = {
    '--kelvin-progress': progress + '%',
    '--kelvin-color': kelvinToTemperatureColor(value),
    '--kelvin-min-color': kelvinToTemperatureColor(KELVIN_MIN),
    '--kelvin-max-color': kelvinToTemperatureColor(KELVIN_MAX),
  };

  return (
    <div className="source-slider" style={sliderStyle}>
      <div className="source-slider-heading">
        <span>{label}</span>
      </div>
      <div className="slider-control">
        <div className="slider-shell">
          <strong className="slider-value">{value.toLocaleString()}K</strong>
          <Slider.Root
            className="kelvin-slider"
            min={KELVIN_MIN}
            max={KELVIN_MAX}
            step={50}
            value={[value]}
            onValueChange={([nextValue]) => onChange(nextValue)}
          >
            <Slider.Track className="kelvin-slider-track">
              <Slider.Range className="kelvin-slider-range" />
            </Slider.Track>
            <Slider.Thumb className="kelvin-slider-thumb" aria-label={label} />
          </Slider.Root>
          <div className="slider-scale" aria-hidden="true">
            <span className="warm-scale">{minLabel}</span>
            <span className="cool-scale">{maxLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationGroup({ title, recommendation, t }) {
  return (
    <section className="recommendation-section">
      <h2>{title}: {recommendation ? formatSigned(recommendation.miredShift, 0) : '--'}</h2>
      <div className="filter-card-list">
        {recommendation ? recommendation.stacks.map((stack) => (
          <FilterStackCard key={stack.key} stack={stack} t={t} />
        )) : <p className="hint-text">{t.noMatchedFilter}</p>}
      </div>
    </section>
  );
}

function FilterStackCard({ stack, t }) {
  const isStacked = stack.filters.length > 1;
  const firstFilter = stack.filters[0];

  return (
    <article className="filter-card">
      <div className="filter-copy">
        <h3>{isStacked ? stack.filters.map((filter) => filter.code).join(' + ') : firstFilter.code + ' ' + firstFilter.name}</h3>
        {isStacked ? (
          <ul className="stack-list" aria-label={t.stackedFilters}>
            {stack.filters.map((filter) => (
              <li key={filter.label}>{filter.code} {filter.name} <span>{formatSigned(filter.miredShift, 0)}</span></li>
            ))}
          </ul>
        ) : null}
        <dl>
          <div><dt>{isStacked ? t.totalMired : t.mired}</dt><dd>{formatSigned(stack.miredShift, 0)}</dd></div>
          {!isStacked && firstFilter.duv1964 !== null ? <div><dt>{t.duv1964}</dt><dd>{formatSigned(firstFilter.duv1964, 6)}</dd></div> : null}
        </dl>
      </div>
      <div className="filter-swatch-stack">
        {stack.filters.map((filter) => (
          <div key={filter.label} className="filter-swatch" style={{ backgroundColor: filter.swatch }}>
            <span>{filter.code}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function findRoscoRecommendations(targetShift, allowStacking) {
  const candidates = createRecommendationCandidates(allowStacking);
  const sorted = candidates.sort((a, b) => a.miredShift - b.miredShift || a.filters.length - b.filters.length || a.key.localeCompare(b.key));
  const aboveShift = sorted.find((candidate) => candidate.miredShift >= targetShift)?.miredShift ?? null;
  const belowShift = [...sorted].reverse().find((candidate) => candidate.miredShift <= targetShift)?.miredShift ?? null;
  return {
    above: buildRecommendation(sorted, aboveShift),
    below: buildRecommendation(sorted, belowShift),
  };
}

function buildRecommendation(candidates, miredShift) {
  if (miredShift === null) return null;
  return {
    miredShift,
    stacks: candidates.filter((candidate) => candidate.miredShift === miredShift).slice(0, 6),
  };
}

function createRecommendationCandidates(allowStacking) {
  const sortedFilters = [...roscoFilters].sort((a, b) => a.miredShift - b.miredShift || a.label.localeCompare(b.label));
  const singleFilters = sortedFilters.map((filter) => createStackCandidate([filter]));
  if (!allowStacking) return singleFilters;

  const stackedFilters = [];
  for (let i = 0; i < sortedFilters.length; i += 1) {
    for (let j = i + 1; j < sortedFilters.length; j += 1) {
      stackedFilters.push(createStackCandidate([sortedFilters[i], sortedFilters[j]]));
    }
  }
  return [...singleFilters, ...stackedFilters];
}

function createStackCandidate(filters) {
  return {
    key: filters.map((filter) => filter.label).join('__'),
    miredShift: filters.reduce((total, filter) => total + filter.miredShift, 0),
    filters,
  };
}

function kelvinToMired(kelvin) {
  return 1000000 / kelvin;
}

function kelvinToTemperatureColor(kelvin) {
  const stops = [
    { kelvin: 2000, color: [217, 105, 35] },
    { kelvin: 3200, color: [227, 148, 55] },
    { kelvin: 5600, color: [21, 111, 134] },
    { kelvin: 10000, color: [40, 145, 181] },
  ];
  const value = Math.min(KELVIN_MAX, Math.max(KELVIN_MIN, kelvin));
  const upperIndex = stops.findIndex((stop) => stop.kelvin >= value);
  const upper = stops[Math.max(upperIndex, 0)];
  const lower = stops[Math.max(upperIndex - 1, 0)];
  const range = upper.kelvin - lower.kelvin || 1;
  const amount = (value - lower.kelvin) / range;
  const [r, g, b] = lower.color.map((channel, index) => Math.round(channel + (upper.color[index] - channel) * amount));
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function formatMiredShift(value) {
  const rounded = Math.round(value);
  return rounded === 0 ? '0' : formatSigned(rounded, 0);
}

function formatMiredValue(value) {
  return Number(value).toFixed(1);
}

function formatSigned(value, digits = 0) {
  const formatted = Number(value).toFixed(digits);
  return value >= 0 ? '+' + formatted : formatted;
}

function getStoredLanguage() {
  const stored = readStoredValue(LANGUAGE_STORAGE_KEY);
  return languages.some((language) => language.code === stored) ? stored : 'zh-CN';
}

function getStoredTheme() {
  const stored = readStoredValue(THEME_STORAGE_KEY);
  return themes.some((theme) => theme.id === stored) ? stored : 'daylight';
}

function readStoredValue(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Local storage can be unavailable in strict privacy modes.
  }
}

function getStandalonePWAStatus() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l2-1.5-2-3.4-2.4 1a8.2 8.2 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.6A8.2 8.2 0 0 0 7 6.6l-2.4-1-2 3.4 2 1.5a7.8 7.8 0 0 0 0 3l-2 1.5 2 3.4 2.4-1a8.2 8.2 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a8.2 8.2 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6 9 12l6 6" />
    </svg>
  );
}

export default App;
