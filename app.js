// F1 Dashboard App
import { renderNextRace } from './components/next-race.js';
import { renderStandingsPreview } from './components/standings-preview.js';
import { renderHistoricalTable } from './components/standings-table.js';
import { renderHeader, populateYearSelector } from './components/header.js';
import { cache } from './utils/cache.js';
import { getNextRaces, getDriverStandings, getConstructorStandings, getYears } from './api/client.js';
import { getDriverStandings as getHistoricalDriverStandings, getConstructorStandings as getHistoricalConstructorStandings } from './api/client.js';

// Variables de estado
let currentYear = new Date().getFullYear();
// Mostrar el último año con datos disponibles
let displayYear = currentYear; 
let selectedHistoricalYear = null;
let historicalTab = 'drivers';

// Elementos globales
let driverStandingsPreview = null;
let constructorStandingsPreview = null;
let historicalTableContainer = null;
let yearSelector = null;
let driversTabBtn = null;
let constructorsTabBtn = null;

// Inicializar aplicación
async function init() {
  try {
    // Inicializar elementos DOM
    driverStandingsPreview = document.getElementById('driver-standings-preview');
    constructorStandingsPreview = document.getElementById('constructor-standings-preview');
    historicalTableContainer = document.getElementById('historical-table-container');
    
    // Ajustar el año a mostrar: usar el más reciente con datos
    const availableYears = await getYears();
    if (availableYears.length > 0) {
      displayYear = availableYears[0]; // Año más reciente
      selectedHistoricalYear = availableYears[0]; // Para la tabla histórica también
      populateYearSelector(selectedHistoricalYear);
    }

    // Verificar elementos DOM
    driversTabBtn = document.getElementById('tab-drivers');
    constructorsTabBtn = document.getElementById('tab-constructors');
    yearSelector = document.getElementById('year-selector');

    // Configurar eventos
    setupEventListeners();
    
    // Renderizar componentes iniciales en el nuevo orden
    await renderMainSection(displayYear); // Sección principal: horario + standings actuales
    await renderHistoricalSection(selectedHistoricalYear, historicalTab); // Sección histórica
    
    // Configurar auto-refresh
    setupAutoRefresh();
    
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

function setupEventListeners() {
  // Cambio de año para la sección histórica (el selector está ahora en la sección histórica)
  if (yearSelector) {
    yearSelector.addEventListener('change', (e) => {
      selectedHistoricalYear = parseInt(e.target.value);
      renderHistoricalTable(historicalTableContainer, selectedHistoricalYear, historicalTab);
    });
  }
  
  // Tabs para rankings históricos
  if (driversTabBtn) {
    driversTabBtn.addEventListener('click', () => {
      if (historicalTab !== 'drivers') {
        historicalTab = 'drivers';
        driversTabBtn.classList.add('active');
        if (constructorsTabBtn) {
          constructorsTabBtn.classList.remove('active');
        }
        getHistoricalDriverStandings(selectedHistoricalYear).then(driverStandings => {
          renderHistoricalTable(historicalTableContainer, selectedHistoricalYear, 'drivers');
        });
      }
    });
  }
  
  if (constructorsTabBtn) {
    constructorsTabBtn.addEventListener('click', () => {
      if (historicalTab !== 'constructors') {
        historicalTab = 'constructors';
        constructorsTabBtn.classList.add('active');
        if (driversTabBtn) {
          driversTabBtn.classList.remove('active');
        }
        getHistoricalConstructorStandings(selectedHistoricalYear).then(constructorStandings => {
          renderHistoricalTable(historicalTableContainer, selectedHistoricalYear, 'constructors');
        });
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

async function renderMainSection(year) {
  try {
    // Renderizar componente de carrera siguiente (primer elemento)
    const nextRaceContainer = document.getElementById('next-race-container');
    if (nextRaceContainer) {
      await renderNextRace(nextRaceContainer);
    }
    
    // Renderizar previsualización de rankings DE ESTE AÑO (no el año seleccionado en el histórico)
    if (driverStandingsPreview && constructorStandingsPreview) {
      renderStandingsPreview(driverStandingsPreview, constructorStandingsPreview, year);
    }
  } catch (error) {
    console.error('Error rendering main section:', error);
  }
}

async function renderHistoricalSection(year, tab) {
  try {
    // Renderizar tabla histórica en la sección inferior
    if (historicalTableContainer) {
      renderHistoricalTable(historicalTableContainer, year, tab);
    }
  } catch (error) {
    console.error('Error rendering historical section:', error);
  }
}

function setupAutoRefresh() {
  // Verificar cada 5 minutos si hay datos expirados
  setInterval(async () => {
    const needsRefresh = checkCacheExpiration();
    if (needsRefresh) {
      console.log('Cache expired, refreshing...');
      await renderMainSection(displayYear);
      await renderHistoricalSection(selectedHistoricalYear, historicalTab);
    }
  }, 5 * 60 * 1000); // 5 minutos
}

function checkCacheExpiration() {
  // Verificar si ha expirado el caché para actualizar datos periódicamente
  return true; // Simplificación para el ejemplo
}

// Función de refresh manual
async function refreshAllData() {
  // Limpiar toda la cache
  cache.clear();
  
  // Reconstruir componentes
  await renderMainSection(displayYear);
  await renderHistoricalSection(selectedHistoricalYear, historicalTab);
}

// Exponer la función de refresh para que pueda ser usada por otros componentes
window.refreshAllData = refreshAllData;

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', init);