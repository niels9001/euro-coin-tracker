// Landen in dezelfde volgorde als de fysieke verzamelmap.
// nl = Nederlandse naam, native = oorspronkelijke naam, flag = emoji vlag
export const COUNTRIES = [
  { code: 'BE', nl: 'België',     native: 'Belgique / België', flag: '🇧🇪' },
  { code: 'BG', nl: 'Bulgarije',  native: 'България',          flag: '🇧🇬' },
  { code: 'CZ', nl: 'Tsjechië',   native: 'Česko',             flag: '🇨🇿' },
  { code: 'DE', nl: 'Duitsland',  native: 'Deutschland',       flag: '🇩🇪' },
  { code: 'EE', nl: 'Estland',    native: 'Eesti',             flag: '🇪🇪' },
  { code: 'IE', nl: 'Ierland',    native: 'Éire',              flag: '🇮🇪' },
  { code: 'ES', nl: 'Spanje',     native: 'España',            flag: '🇪🇸' },
  { code: 'GR', nl: 'Griekenland',native: 'Ελλάδα',            flag: '🇬🇷' },
  { code: 'FR', nl: 'Frankrijk',  native: 'France',            flag: '🇫🇷' },
  { code: 'HR', nl: 'Kroatië',    native: 'Hrvatska',          flag: '🇭🇷' },
  { code: 'IT', nl: 'Italië',     native: 'Italia',            flag: '🇮🇹' },
  { code: 'CY', nl: 'Cyprus',     native: 'Κύπρος',            flag: '🇨🇾' },
  { code: 'LT', nl: 'Litouwen',   native: 'Lietuva',           flag: '🇱🇹' },
  { code: 'LV', nl: 'Letland',    native: 'Latvija',           flag: '🇱🇻' },
  { code: 'LU', nl: 'Luxemburg',  native: 'Luxembourg',        flag: '🇱🇺' },
  { code: 'HU', nl: 'Hongarije',  native: 'Magyarország',      flag: '🇭🇺' },
  { code: 'MT', nl: 'Malta',      native: 'Malta',             flag: '🇲🇹' },
  { code: 'NL', nl: 'Nederland',  native: 'Nederland',         flag: '🇳🇱' },
  { code: 'AT', nl: 'Oostenrijk', native: 'Österreich',        flag: '🇦🇹' },
  { code: 'PL', nl: 'Polen',      native: 'Polska',            flag: '🇵🇱' },
  { code: 'PT', nl: 'Portugal',   native: 'Portugal',          flag: '🇵🇹' },
  { code: 'RO', nl: 'Roemenië',   native: 'România',           flag: '🇷🇴' },
  { code: 'SI', nl: 'Slovenië',   native: 'Slovenija',         flag: '🇸🇮' },
  { code: 'SK', nl: 'Slowakije',  native: 'Slovensko',         flag: '🇸🇰' },
  { code: 'FI', nl: 'Finland',    native: 'Suomi',             flag: '🇫🇮' },
];

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
