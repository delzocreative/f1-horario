export function getFlagUrl(countryCode, size = 32) {
  // CDN: flagcdn.com
  // Si no se proporciona un countryCode válido, usar 'xx' (bandera desconocida)
  const validCode = countryCode || 'xx';
  return `https://flagcdn.com/w${size}/${validCode}.png`;
}

export function getFlagSrcset(countryCode) {
  return `
    https://flagcdn.com/w20/${countryCode || 'xx'}.png 1x,
    https://flagcdn.com/w32/${countryCode || 'xx'}.png 1.5x,
    https://flagcdn.com/w40/${countryCode || 'xx'}.png 2x,
    https://flagcdn.com/w80/${countryCode || 'xx'}.png 3x
  `;
}

// Importar desde timezones
import { LATAM_COUNTRIES } from './timezones.js';

export function getCountryCode(countryName) {
  // Expandir la lista de mapeo de países para incluir más países F1
  const mapping = {
    'Australia': 'au',
    'Austria': 'at',
    'Bahrain': 'bh', 
    'Belgium': 'be',
    'Brazil': 'br',
    'Canada': 'ca',
    'China': 'cn',
    'Finland': 'fi',
    'France': 'fr',
    'Germany': 'de',
    'Hungary': 'hu',
    'Italy': 'it',
    'Japan': 'jp',
    'Luxembourg': 'lu',
    'Malaysia': 'my',
    'Mexico': 'mx',
    'Monaco': 'mc',
    'Netherlands': 'nl',
    'Portugal': 'pt',
    'San Marino': 'sm',
    'Singapore': 'sg',
    'South Korea': 'kr',
    'Spain': 'es',
    'Sweden': 'se',
    'Switzerland': 'ch',
    'UK': 'gb',
    'USA': 'us',
    'Argentina': 'ar',
    'Chile': 'cl',
    'Colombia': 'co',
    'Venezuela': 've',
    'Peru': 'pe',
    'Ecuador': 'ec',
    'Uruguay': 'uy',
    'Paraguay': 'py',
    'Bolivia': 'bo',
    'Guyana': 'gy',
    'Suriname': 'sr',
    'Guatemala': 'gt',
    'El Salvador': 'sv',
    'Honduras': 'hn',
    'Nicaragua': 'ni',
    'Costa Rica': 'cr',
    'Panama': 'pa',
    'Cuba': 'cu',
    'Dominican Republic': 'do',
    'Puerto Rico': 'pr'
  };
  
  return mapping[countryName] || 'xx'; // Código 'xx' para bandera desconocida
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