export function getFlagUrl(countryCode, size = 40) {
  return `https://flagcdn.com/w${size}/${countryCode}.png`;
}

export function getFlagSrcset(countryCode) {
  return `
    https://flagcdn.com/w40/${countryCode}.png 1x,
    https://flagcdn.com/w80/${countryCode}.png 2x,
    https://flagcdn.com/w160/${countryCode}.png 3x
  `;
}

// Mapping countries to ISO codes
export function getCountryCode(countryName) {
  const mapping = {
    'Argentina': 'ar',
    'Australia': 'au',
    'Brazil': 'br',
    'Bahrain': 'bh',
    'Saudi Arabia': 'sa',
    'Japan': 'jp',
    'China': 'cn',
    'USA': 'us',
    'Canada': 'ca',
    'Monaco': 'mc',
    'Spain': 'es',
    'Austria': 'at',
    'UK': 'gb',
    'Belgium': 'be',
    'Hungary': 'hu',
    'Netherlands': 'nl',
    'Italy': 'it',
    'Azerbaijan': 'az',
    'Singapore': 'sg',
    'Mexico': 'mx',
    'Malaysia': 'my',
    'Brazil': 'br',
    'Mexico': 'mx',
    'Ecuador': 'ec',
    'Venezuela': 've',
    'Chile': 'cl',
    'Peru': 'pe',
    'Colombia': 'co',
    'Guatemala': 'gt',
    'El Salvador': 'sv',
    'Honduras': 'hn',
    'Nicaragua': 'ni',
    'Costa Rica': 'cr',
    'Bolivia': 'bo',
    'Paraguay': 'py',
    'Uruguay': 'uy',
    'Republic of Korea': 'kr',
    'Russian Federation': 'ru',
    'Turkey': 'tr',
    'Algeria': 'dz',
    'Ukraine': 'ua',
    'Portugal': 'pt',
    'France': 'fr',
    'Switzerland': 'ch',
    'Germany': 'de'
  };
  
  return mapping[countryName] || 'xx';
}

// Convert UTC date string to local string format
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}