// Generieke muntweergave als SVG. Twee states (collected / empty) via CSS.
// tier kleurklassen: copper (1/2/5c), gold (10/20/50c), bicolor1 (€1), bicolor2 (€2)

import { DENOMINATIONS } from './data.js';

const TIER_FILL = {
  copper:    { outer: '#b87333', inner: '#cf8a4a', rim: '#7a4a1f' },
  gold:      { outer: '#d4a82a', inner: '#f0c542', rim: '#8a6a17' },
  bicolor1:  { outer: '#d4d4d4', inner: '#d4a82a', rim: '#7a7a7a' }, // €1: zilver buitenring, gouden kern
  bicolor2:  { outer: '#d4a82a', inner: '#d4d4d4', rim: '#8a6a17' }, // €2: gouden buitenring, zilveren kern
};

export function coinSVG(denom, collected) {
  const c = TIER_FILL[denom.tier];
  const opacity = collected ? '1' : '0.35';
  const stroke = collected ? c.rim : '#3a4a78';
  const strokeStyle = collected ? '' : 'stroke-dasharray="3 3"';
  const innerR = 26;

  return `
    <svg viewBox="0 0 80 80" class="coin ${collected ? 'is-collected' : 'is-empty'}" aria-hidden="true">
      <defs>
        <radialGradient id="g-${denom.id}-${collected ? 'c' : 'e'}" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="white" stop-opacity="${collected ? 0.55 : 0.15}"/>
          <stop offset="60%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="36" fill="${c.outer}" stroke="${stroke}" stroke-width="2" ${strokeStyle} opacity="${opacity}"/>
      <circle cx="40" cy="40" r="${innerR}" fill="${c.inner}" opacity="${opacity}"/>
      <circle cx="40" cy="40" r="36" fill="url(#g-${denom.id}-${collected ? 'c' : 'e'})"/>
      <text x="40" y="${denom.sub === 'euro' ? 44 : 46}" text-anchor="middle"
            font-family="Georgia, serif" font-weight="bold"
            font-size="${denom.sub === 'euro' ? 26 : 22}"
            fill="#2a1a05" opacity="${collected ? 0.85 : 0.3}">${denom.label}</text>
      ${denom.sub === 'cent'
        ? `<text x="40" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#2a1a05" opacity="${collected ? 0.75 : 0.3}">CENT</text>`
        : `<text x="40" y="58" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#2a1a05" opacity="${collected ? 0.75 : 0.3}">EURO</text>`}
    </svg>
  `;
}

export { DENOMINATIONS };
