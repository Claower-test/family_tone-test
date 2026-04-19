// TODO delete entire file after agreed color
import { useState } from 'react';
import { generateBrandScale, hexToRgb } from './colorScale';

function applyTheme(hex: string) {
  const scale = generateBrandScale(hex);
  const root = document.documentElement;

  root.style.setProperty('--color-brand-50', scale['50']);
  root.style.setProperty('--color-brand-100', scale['100']);
  root.style.setProperty('--color-brand-200', scale['200']);
  root.style.setProperty('--color-brand-300', scale['300']);
  root.style.setProperty('--color-brand-400', scale['400']);
  root.style.setProperty('--color-brand', scale['500']);
  root.style.setProperty('--color-brand-500', scale['500']);
  root.style.setProperty('--color-brand-600', scale['600']);
  root.style.setProperty('--color-brand-700', scale['700']);
  root.style.setProperty('--color-brand-hover', scale['600']);

  const rgb500 = hexToRgb(scale['500']);
  const rgb600 = hexToRgb(scale['600']);
  const rgb700 = hexToRgb(scale['700']);

  let styleEl = document.getElementById('dev-theme') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dev-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    .cta-btn {
      background: linear-gradient(135deg, ${scale['500']} 0%, ${scale['600']} 100%) !important;
    }
    .cta-btn:hover {
      box-shadow: 0 8px 30px rgba(${rgb500}, 0.35) !important;
    }
    .gradient-text {
      background: linear-gradient(135deg, ${scale['500']} 0%, ${scale['600']} 40%, ${scale['300']} 70%, ${scale['200']} 100%) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    .btn-primary {
      background: linear-gradient(to right, ${scale['500']}, ${scale['600']}) !important;
    }
    .btn-primary:hover {
      box-shadow: 0 8px 30px rgba(${rgb500}, 0.3) !important;
    }
    .record-btn-float {
      background: linear-gradient(135deg, ${scale['500']} 0%, ${scale['600']} 100%) !important;
      box-shadow: 0 8px 32px rgba(${rgb500}, 0.4) !important;
    }
    .record-btn-float:hover {
      box-shadow: 0 12px 40px rgba(${rgb500}, 0.45) !important;
    }
    .orb-gradient-brand {
      background: radial-gradient(circle, rgba(${rgb500}, 0.1), transparent 70%) !important;
    }
    .orb-gradient-brand-subtle {
      background: radial-gradient(circle, rgba(${rgb500}, 0.06), transparent 70%) !important;
    }
    .orb-gradient-brand-faint {
      background: radial-gradient(circle, rgba(${rgb500}, 0.04), transparent 70%) !important;
    }
    .orb-gradient-brand-cta {
      background: radial-gradient(circle, rgba(${rgb700}, 0.08), transparent 70%) !important;
    }
    .orb-gradient-red-subtle {
      background: radial-gradient(circle, rgba(${rgb600}, 0.06), transparent 70%) !important;
    }
    @keyframes recordPulse {
      0%, 100% { box-shadow: 0 8px 40px rgba(${rgb500}, 0.5); }
      50% { box-shadow: 0 12px 60px rgba(${rgb500}, 0.6); }
    }
  `;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function DevColorPicker() {
  const [color, setColor] = useState('#5B5EA6');
  const [hexInput, setHexInput] = useState('#5B5EA6');
  const [isOpen, setIsOpen] = useState(false);

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const hex = e.target.value;
    setColor(hex);
    setHexInput(hex);
    applyTheme(hex);
  }

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const val = raw.startsWith('#') ? raw : '#' + raw;
    setHexInput(val);
    if (HEX_RE.test(val)) {
      setColor(val);
      applyTheme(val);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen && (
        <div className="mb-3 rounded-xl bg-white p-3 shadow-lg border border-[#f0f0f0]">
          <input
            type="color"
            value={color}
            onChange={handlePickerChange}
            className="w-full h-32 rounded-lg cursor-pointer border-0 p-0"
          />
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInput}
            maxLength={9}
            className="mt-2 w-full rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-3 py-2 text-xs font-mono text-neutral-700 outline-none focus:border-brand-300"
            placeholder="#5B5EA6"
          />
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="w-10 h-10 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110"
          style={{ background: color }}
          title="Dev: Pick brand color"
        />
      </div>
    </div>
  );
}
