// Calcular tiempo restante para una fecha
export function getTimeRemaining(endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  if (total <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }
  
  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}

// Formatear countdown
export function formatCountdown(remaining) {
  if (remaining.total <= 0) {
    return 'La carrera ha comenzado!';
  }
  
  const parts = [];
  if (remaining.days > 0) parts.push(`${remaining.days}d`);
  if (remaining.hours > 0) parts.push(`${remaining.hours}h`);
  if (remaining.minutes > 0) parts.push(`${remaining.minutes}m`);
  // No mostrar segundos por simplicidad
  
  return parts.join(' ');
}

// Comprobar si una carrera ya comenzó
export function hasRaceStarted(date) {
  return Date.parse(new Date()) > Date.parse(date);
}