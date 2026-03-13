import { detectUserCountry, getAllLATAMTimes, getCountryName, getCountryInfo } from '../utils/timezones.js';
import { getFlagUrl } from '../utils/flags.js';

export function createTimezoneSelector(container, utcDate, onCountryChange) {
  // Obtener preferencia guardada o detectar automáticamente
  const savedCountry = localStorage.getItem('f1_preferred_country');
  const detectedCountry = detectUserCountry();
  const initialCountry = savedCountry || detectedCountry;
  
  // Render inicial
  render(container, utcDate, initialCountry, onCountryChange);
  
  // Devolver función para actualizar
  return {
    update: (newDate) => render(container, newDate, initialCountry, onCountryChange),
    setCurrentCountry: (countryCode) => {
      localStorage.setItem('f1_preferred_country', countryCode);
      render(container, utcDate, countryCode, onCountryChange);
    }
  };
}

function render(container, utcDate, selectedCountry, onCountryChange) {
  const allTimes = getAllLATAMTimes(utcDate);
  const selected = allTimes.find(t => t.code === selectedCountry) || allTimes[0];
  const userCountry = getCountryName(selectedCountry);
  
  container.innerHTML = `
    <div class="timezone-selector">
      <div class="timezone-main">
        <button class="country-btn" id="country-select-btn" title="Cambiar país">
          <img src="${getFlagUrl(selectedCountry, 32)}" alt="${userCountry}" class="flag" onerror="this.src='https://flagcdn.com/w20/xx.png'" />
          <span class="country-name">${userCountry}</span>
          <span class="dropdown-icon">▼</span>
        </button>
        <div class="time-display">
          <span class="time">${selected.time}</span>
          <span class="offset">${selected.offset}</span>
        </div>
        <button class="view-all-btn" id="view-all-btn">
          Ver todos ↓
        </button>
      </div>
    </div>
  `;
  
  // Event listeners
  setupEventListeners(container, utcDate, allTimes, onCountryChange);
}

function setupEventListeners(container, utcDate, allTimes, onCountryChange) {
  const modal = document.getElementById('timezone-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('modal-close');
  const viewAllBtn = container.querySelector('#view-all-btn');
  const countryBtn = container.querySelector('#country-select-btn');

  // Funciones para manejar modal
  const openModal = () => {
    if (!modal) return;
    
    // Rellenar el cuerpo del modal con todas las opciones
    const modalBody = document.getElementById('timezone-modal-body');
    if (modalBody) {
      modalBody.innerHTML = allTimes.map(country => `
        <button class="country-row ${country.code === localStorage.getItem('f1_preferred_country') ? 'selected' : ''}" 
                data-country="${country.code}">
          <img src="${getFlagUrl(country.code, 24)}" alt="${country.name}" class="flag" onerror="this.src='https://flagcdn.com/w20/xx.png'" />
          <span class="country-name">${country.name}</span>
          <span class="time">${country.time}</span>
          <span class="offset">${country.offset}</span>
        </button>
      `).join('');
    }
    
    modal.hidden = false;
    document.body.style.overflow = 'hidden'; // Prevenir scroll
    
    // Hacer focusing al modal para mejor UX
    modal.focus();
  };
  
  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  };
  
  // Asociar eventos al botón de ver todos si existe el modal
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', openModal);
  }

  // Botón de país (también abre modal para selección rápida)
  if (countryBtn) {
    countryBtn.addEventListener('click', openModal);
  }

  // Cerrar modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }
  
  // Eventos para cada país en el modal
  if (modal) {
    const countryRows = modal.querySelectorAll('.country-row');
    countryRows.forEach(row => {
      row.addEventListener('click', () => {
        const countryCode = row.dataset.country;
        localStorage.setItem('f1_preferred_country', countryCode);
        
        // Actualizar el selector principal
        const containerElement = document.getElementById('next-race-container');
        if (containerElement) {
          const timezoneContainer = containerElement.querySelector('.timezone-selector-container');
          if (timezoneContainer) {
            const allTimesForUpdate = getAllLATAMTimes(utcDate);
            render(timezoneContainer, utcDate, countryCode, onCountryChange);
          }
        }
        
        onCountryChange?.(countryCode, utcDate);
        closeModal();
      });
    });
  }
  
  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      closeModal();
    }
  });
}