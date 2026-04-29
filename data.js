// Landen in dezelfde volgorde als de fysieke verzamelmap.
// nl = Nederlandse naam, native = oorspronkelijke naam, eurozone = of het euromunten uitgeeft
export const COUNTRIES = [
  { code: 'BE', nl: 'België',     native: 'Belgique / België', eurozone: true  },
  { code: 'BG', nl: 'Bulgarije',  native: 'България',          eurozone: false },
  { code: 'CZ', nl: 'Tsjechië',   native: 'Česko',             eurozone: false },
  { code: 'DE', nl: 'Duitsland',  native: 'Deutschland',       eurozone: true  },
  { code: 'EE', nl: 'Estland',    native: 'Eesti',             eurozone: true  },
  { code: 'IE', nl: 'Ierland',    native: 'Éire',              eurozone: true  },
  { code: 'ES', nl: 'Spanje',     native: 'España',            eurozone: true  },
  { code: 'GR', nl: 'Griekenland',native: 'Ελλάδα',            eurozone: true  },
  { code: 'FR', nl: 'Frankrijk',  native: 'France',            eurozone: true  },
  { code: 'HR', nl: 'Kroatië',    native: 'Hrvatska',          eurozone: true  },
  { code: 'IT', nl: 'Italië',     native: 'Italia',            eurozone: true  },
  { code: 'CY', nl: 'Cyprus',     native: 'Κύπρος',            eurozone: true  },
  { code: 'LT', nl: 'Litouwen',   native: 'Lietuva',           eurozone: true  },
  { code: 'LV', nl: 'Letland',    native: 'Latvija',           eurozone: true  },
  { code: 'LU', nl: 'Luxemburg',  native: 'Luxembourg',        eurozone: true  },
  { code: 'HU', nl: 'Hongarije',  native: 'Magyarország',      eurozone: false },
  { code: 'MT', nl: 'Malta',      native: 'Malta',             eurozone: true  },
  { code: 'NL', nl: 'Nederland',  native: 'Nederland',         eurozone: true  },
  { code: 'AT', nl: 'Oostenrijk', native: 'Österreich',        eurozone: true  },
  { code: 'PL', nl: 'Polen',      native: 'Polska',            eurozone: false },
  { code: 'PT', nl: 'Portugal',   native: 'Portugal',          eurozone: true  },
  { code: 'RO', nl: 'Roemenië',   native: 'România',           eurozone: false },
  { code: 'SI', nl: 'Slovenië',   native: 'Slovenija',         eurozone: true  },
  { code: 'SK', nl: 'Slowakije',  native: 'Slovensko',         eurozone: true  },
  { code: 'FI', nl: 'Finland',    native: 'Suomi',             eurozone: true  },
];

// Helper: vlag-image URL (SVG via flagcdn.com — werkt op Windows ook)
export function flagUrl(code) {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

// 8 muntdenominaties in vaste volgorde (zoals in de map: van klein naar groot)
export const DENOMINATIONS = [
  { id: '1c',  label: '1',   sub: 'cent', tier: 'copper' },
  { id: '2c',  label: '2',   sub: 'cent', tier: 'copper' },
  { id: '5c',  label: '5',   sub: 'cent', tier: 'copper' },
  { id: '10c', label: '10',  sub: 'cent', tier: 'gold'   },
  { id: '20c', label: '20',  sub: 'cent', tier: 'gold'   },
  { id: '50c', label: '50',  sub: 'cent', tier: 'gold'   },
  { id: '1e',  label: '1',   sub: 'euro', tier: 'bicolor1' },
  { id: '2e',  label: '2',   sub: 'euro', tier: 'bicolor2' },
];

export const TOTAL_COINS = COUNTRIES.length * DENOMINATIONS.length;
