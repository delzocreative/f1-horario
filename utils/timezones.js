const LATAM_COUNTRIES = {
  'mx': { name: 'México', timezone: 'America/Mexico_City' },
  'gt': { name: 'Guatemala', timezone: 'America/Guatemala' },
  'sv': { name: 'El Salvador', timezone: 'America/El_Salvador' },
  'hn': { name: 'Honduras', timezone: 'America/Tegucigalpa' },
  'ni': { name: 'Nicaragua', timezone: 'America/Managua' },
  'cr': { name: 'Costa Rica', timezone: 'America/Costa_Rica' },
  'co': { name: 'Colombia', timezone: 'America/Bogota' },
  'ec': { name: 'Ecuador', timezone: 'America/Guayaquil' },
  'pe': { name: 'Perú', timezone: 'America/Lima' },
  'pa': { name: 'Panamá', timezone: 'America/Panama' },
  'do': { name: 'Rep. Dominicana', timezone: 'America/Santo_Domingo' },
  'bo': { name: 'Bolivia', timezone: 'America/La_Paz' },
  've': { name: 'Venezuela', timezone: 'America/Caracas' },
  'py': { name: 'Paraguay', timezone: 'America/Asuncion' },
  'ar': { name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  'uy': { name: 'Uruguay', timezone: 'America/Montevideo' },
  'cl': { name: 'Chile', timezone: 'America/Santiago' },
  'br': { name: 'Brasil', timezone: 'America/Sao_Paulo' },
};

// Detectar país del usuario por timezone del navegador
export function detectUserCountry() {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Buscar matching en LATAM
  for (const [code, data] of Object.entries(LATAM_COUNTRIES)) {
    if (data.timezone === userTimezone) {
      localStorage.setItem('f1_preferred_country', code);
      return code;
    }
  }
  
  // Fallback a Argentina si no encuentra
  localStorage.setItem('f1_preferred_country', 'ar');
  return 'ar';
}

// Convertir fecha UTC a timezone específico
export function convertToTimezone(utcDate, timezone) {
  return new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
}

// Formatear hora con timezone
export function formatTimeWithTimezone(utcDate, timezone, locale = 'en-US') {
  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  };
  
  return utcDate.toLocaleTimeString(locale, options);
}

// Obtener offset UTC de un timezone
export function getUTCOffset(timezone) {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  const diff = (tzDate - utcDate) / (1000 * 60 * 60); // diferencia en horas
  const sign = diff >= 0 ? '+' : '-';
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff);
  const minutes = Math.round((absDiff % 1) * 60);
  
  const hoursStr = Math.abs(hours).toString();
  const minutesStr = minutes.toString().padStart(2, '0');
  
  return `UTC${sign}${hoursStr}:${minutesStr}`;
}

// Generar lista de todos los horarios LATAM
export function getAllLATAMTimes(utcDate) {
  const times = [];
  for (const [code, data] of Object.entries(LATAM_COUNTRIES)) {
    times.push({
      code,
      name: data.name,
      time: formatTimeWithTimezone(utcDate, data.timezone),
      offset: getUTCOffset(data.timezone),
      timezone: data.timezone,
    });
  }
  
  // Ordenar por offset (desde UTC-6 hasta UTC-2)
  times.sort((a, b) => {
    const offsetA = parseFloat(a.offset.split(':')[0].replace('UTC', ''));
    const offsetB = parseFloat(b.offset.split(':')[0].replace('UTC', ''));
    return offsetA - offsetB;
  });
  
  return times;
}

// Obtener info de un país específico
export function getCountryInfo(code) {
  return LATAM_COUNTRIES[code];
}

// Obtener nombre de país por código
export function getCountryName(code) {
  return LATAM_COUNTRIES[code]?.name || 'País desconocido';
}