// F1 Dashboard App
import { renderNextRace } from './components/next-race.js';
import { renderStandingsPreview } from './components/standings-preview.js';
import { renderHistoricalTable } from './components/standings-table.js';
import { renderHeader, populateYearSelector } from './components/header.js';
import { cache } from './utils/cache.js';
import { getNextRaces, getDriverStandings, getConstructorStandings, getYears } from './api/client.js';

// Variables de estado
let currentYear = new Date().getFullYear();
let currentTab = 'drivers';

// Elementos DOM
const nextRaceContainer = document.getElementById('next-race-container');
const driverStandingsPreview = document.getElementById('driver-standings-preview');
const constructorStandingsPreview = document.getElementById('constructor-standings-preview');
const historicalTableContainer = document.getElementById('historical-table-container');

// Inicializar aplicación
async function init() {
  try {
    // Populating year selector
    const availableYears = await populateYearSelector(currentYear);
    
    // Actualizar currentYear si está disponible o ajustarlo al más reciente
    if (!availableYears.includes(currentYear)) {
      currentYear = availableYears[0] || new Date().getFullYear();
    }
    
    // Configurar eventos
    setupEventListeners();
    
    // Renderizar componentes iniciales
    await renderAllComponents(currentYear);
    
    // Configurar auto-refresh
    setupAutoRefresh();
    
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

function setupEventListeners() {
  // Cambio de año
  const yearSelector = document.getElementById('year-selector');
  if (yearSelector) {
    yearSelector.addEventListener('change', (e) => {
      currentYear = parseInt(e.target.value);
      renderAllComponents(currentYear);
    });
  }
  
  // Tabs para rankings históricos
  const driversTabBtn = document.getElementById('tab-drivers');
  const constructorsTabBtn = document.getElementById('tab-constructors');
  
  if (driversTabBtn) {
    driversTabBtn.addEventListener('click', () => {
      if (currentTab !== 'drivers') {
        currentTab = 'drivers';
        driversTabBtn.classList.add('active');
        constructorsTabBtn.classList.remove('active');
        renderHistoricalTable(historicalTableContainer, currentYear, 'drivers');
      }
    });
  }
  
  if (constructorsTabBtn) {
    constructorsTabBtn.addEventListener('click', () => {
      if (currentTab !== 'constructors') {
        currentTab = 'constructors';
        constructorsTabBtn.classList.add('active');
        driversTabBtn.classList.remove('active');
        renderHistoricalTable(historicalTableContainer, currentYear, 'constructors');
      }
    });
  }
  
  // Cerrar modal con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('timezone-modal');
      if (modal && !modal.hidden) {
        modal.hidden = true;
        document.body.style.overflow = '';
      }
    }
  });
}

async function renderAllComponents(year) {
  try {
    // Renderizar componente de carrera siguiente
    if (nextRaceContainer) {
      await renderNextRace(nextRaceContainer);
    }
    
    // Renderizar previsualización de rankings
    if (driverStandingsPreview && constructorStandingsPreview) {
      renderStandingsPreview(driverStandingsPreview, constructorStandingsPreview, year);
    }
    
    // Renderizar tabla histórica
    if (historicalTableContainer) {
      renderHistoricalTable(historicalTableContainer, year, currentTab);
    }
  } catch (error) {
    console.error('Error rendering components:', error);
  }
}

function setupAutoRefresh() {
  // Verificar cada 5 minutos si hay datos expirados
  setInterval(async () => {
    const needsRefresh = checkCacheExpiration();
    if (needsRefresh) {
      console.log('Cache expired, refreshing...');
      await renderAllComponents(currentYear);
    }
  }, 5 * 60 * 1000); // 5 minutos
}

function checkCacheExpiration() {
  // En realidad podríamos verificar si los datos en caché han expirado
  // pero para simplificar, podríamos siempre verificar periódicamente
  return true; // Simplificación para el ejemplo
}

// Función de refresh manual
async function refreshAllData() {
  // Limpiar toda la cache
  cache.clear();
  
  // Reconstruir componentes
  await renderAllComponents(currentYear);
}

// Exponer la función de refresh para que pueda ser usada por otros componentes
window.refreshAllData = refreshAllData;

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', init);