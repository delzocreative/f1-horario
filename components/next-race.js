import { createTimezoneSelector } from './timezone-selector.js';
import { getCountryCode, getFlagUrl } from '../utils/flags.js';
import { getTimeRemaining, formatCountdown, hasRaceStarted } from '../utils/date.js';
import { getCircuitImageUrl } from './circuits.js';
import { detectUserCountry } from '../utils/timezones.js';
import { getNextRaces } from '../api/client.js';

export async function renderNextRace(container) {
  try {
    // Mostrar skeleton mientras carga
    container.innerHTML = `
      <div class="loading">
        <div class="skeleton-box main-race-skeleton"></div>
        <div class="skeleton-list">
          <div class="skeleton-text short"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>
    `;
    
    // Fetch data
    const races = await getNextRaces();
    
    if (!races || races.length === 0) {
      container.innerHTML = `
        <h3>🏁 Próxima Carrera</h3>
        <p>No hay carreras programadas próximamente</p>
      `;
      return;
    }
    
    const nextRace = races[0];
    
    if (!nextRace || !nextRace.Circuit) {
      container.innerHTML = `
        <h3>🏁 Próxima Carrera</h3>
        <p>No se encontraron datos de la próxima carrera</p>
      `;
      return;
    }
    
    // Crear contenedor para el selector de tiempo
    const timezoneContainer = document.createElement('div');
    timezoneContainer.className = 'timezone-selector-container';
    
    container.innerHTML = '';
    
    // Título
    container.insertAdjacentHTML('beforeend', `<h3>🏁 Próxima Carrera</h3>`);
    
    // Elemento de la carrera
    const raceElement = createRaceElement(nextRace);
    container.appendChild(raceElement);
    container.appendChild(timezoneContainer);
    
    // Inicializar el selector de zona horaria
    const raceDate = new Date(`${nextRace.date}T${nextRace.time}`);
    const timezoneControls = createTimezoneSelector(timezoneContainer, raceDate, (countryCode, date) => {
      // Actualizar el contador de tiempo cuando cambia el país
      updateTimeRemaining(nextRace, date);
    });
    
    // Iniciar actualización continua del tiempo restante
    startTimeRemainingUpdates(nextRace);
    
  } catch (error) {
    console.error('Error rendering next race:', error);
    container.innerHTML = `
      <h3>🏁 Próxima Carrera</h3>
      <p>Error cargando la próxima carrera</p>
    `;
  }
}

function createRaceElement(race) {
  const countryCode = getCountryCode(race.Circuit.Location.country);
  const raceDate = new Date(`${race.date}T${race.time}`);
  
  const container = document.createElement('div');
  container.className = 'main-race';
  
  container.innerHTML = `
    <div class="race-image-container">
      <img src="${race.circuitImage || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect fill="%231e293b" width="400" height="200"/><text fill="%2364748b" font-family="Arial" font-size="16" x="50" y="100">Imagen del circuito</text></svg>'}" 
           alt="${race.circuitName}" 
           loading="lazy"
           onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"200\" viewBox=\"0 0 400 200\"><rect fill=\"%231e293b\" width=\"400\" height=\"200\"/><text fill=\"%2364748b\" font-family=\"Arial\" font-size=\"16\" x=\"50\" y=\"100\">Imagen del circuito</text></svg>'; this.classList.add('placeholder');"
           style="object-fit: cover; width: 100%; height: 100%;" />
      <img src="${getFlagUrl(countryCode, 32)}" alt="${race.Circuit.Location.country}" class="race-flag" 
           onerror="this.src='https://flagcdn.com/w20/xx.png';this.style.display='none';" 
           style="position: absolute; top: 0.5rem; right: 0.5rem; border-radius: 0.25rem; border: 2px solid white; width: 32px; height: 24px; z-index: 2;" />
    </div>
    
    <div class="race-info">
      <h2 class="race-name">${race.raceName}</h2>
      <p class="circuit-name">${race.Circuit.circuitName}, ${race.Circuit.Location.locality}</p>
      <div class="race-date">
        <p>${raceDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <div class="countdown" id="countdown-${race.round}">
        Calculando tiempo restante...
      </div>
    </div>
  `;
  
  // Obtener la imagen del circuito después de renderizar
  (async () => {
    try {
      const circuitImageUrl = await getCircuitImageUrl(race.Circuit.circuitName);
      const imgElement = container.querySelector('.race-image-container img:not(.race-flag)');
      if (imgElement && imgElement.src.includes('Imagen del circuito')) {
        imgElement.src = circuitImageUrl;
      }
    } catch (error) {
      console.log('Error loading circuit image:', error);
    }
  })();
  
  return container;
}

function updateTimeRemaining(race, dateOverride) {
  const raceDate = dateOverride || new Date(`${race.date}T${race.time}`);
  const remaining = getTimeRemaining(raceDate);
  
  const countdownEl = document.getElementById(`countdown-${race.round}`);
  if (countdownEl) {
    countdownEl.textContent = formatCountdown(remaining);
    if (remaining.total <= 0) {
      countdownEl.textContent = '¡La carrera ha comenzado!';
      countdownEl.style.color = '#38bdf8'; // Azul para indicar carrera activa
    }
  }
}

function startTimeRemainingUpdates(race) {
  const raceDate = new Date(`${race.date}T${race.time}`);
  
  // Actualizar inmediatamente
  updateTimeRemaining(race);
  
  // Actualizar cada minuto
  const interval = setInterval(() => {
    updateTimeRemaining(race);
    const remaining = getTimeRemaining(raceDate);
    if (remaining.total <= 0) {
      clearInterval(interval); // Parar cuando comience la carrera
    }
  }, 60000); // Cada minuto
  
  // También actualizar cada cambio de país (esto se hará desde el selector)
}

// Exportación para el módulo
export { updateTimeRemaining, startTimeRemainingUpdates };