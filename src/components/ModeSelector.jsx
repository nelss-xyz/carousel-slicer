import './ModeSelector.css';
import { FORMATS, FORMAT_ORDER } from '../config/formats';

/* ── SVG icons per format ────────────────────────────────────────── */

const ICONS = {
  post: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  ),
  carousel: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h3v12H6zM10.5 6h3v12h-3zM15 6h3v12h-3z" />
    </svg>
  ),
  cover: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M9.75 3.75v16.5M14.25 3.75v16.5" />
    </svg>
  ),
};

/**
 * Landing grid for choosing a processing mode.
 *
 * @param {{ onSelect: (formatId: string) => void }} props
 */
export default function ModeSelector({ onSelect }) {
  return (
    <div className="mode-selector" role="list">
      {FORMAT_ORDER.map((id) => {
        const fmt = FORMATS[id];
        return (
          <div
            key={id}
            className="mode-card"
            role="listitem"
            tabIndex={0}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(id)}
          >
            <div className="mode-card__icon">
              {ICONS[fmt.icon]}
            </div>
            <div className="mode-card__text">
              <p className="mode-card__label">{fmt.label}</p>
              <p className="mode-card__desc">{fmt.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
