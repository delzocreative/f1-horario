// F1 Dashboard App
import { renderNextRace } from './components/next-race.js';
import { renderStandingsPreview } from './components/standings-preview.js';
import { renderHistoricalTable } from './components/standings-table.js';
import { renderHeader, populateYearSelector } from './components/header.js';
import { cache } from './utils/cache.js';
import { getNextRaces, getDriverStandings, getConstructorStandings } from './api/client.js';

// Variables de estado
let currentYear = new Date().getFullYear();
// Mostrar el último año con datos (si estamos en 2026, mostrar 2025)
let displayYear = currentYear; 

// Variables globales para poder actualizar las tablas por separado
let selectedHistoricalYear = null;
let historicalTab = 'drivers';

// Elementos DOM (reescribiendo la estructura de carga)
const container = document.querySelector('.container');
const headerContainer = container.querySelector('.header');
const mainContent = container.querySelector('.main-content');

// Obtener elementos de las secciones principales
const nextRaceContainer = document.getElementById('next-race-container');
const driverStandingsPreview = document.getElementById('driver-standings-preview');
const constructorStandingsPreview = document.getElementById('constructor-standings-preview');
const historicalTableContainer = document.getElementById('historical-table-container');

// Inicializar aplicación
async function init() {
  try {
    // Ajustar el año a mostrar: usar el más reciente con datos
    if (currentYear >= 2020) {
      displayYear = currentYear - 1; // Mostrar el último año con datos
    } else {
      displayYear = currentYear; // En caso extremo
    }
    
    // Populating year selector
    const availableYears = await populateYearSelector(displayYear);
    
    // Actualizar selectedHistoricalYear con el disponible más reciente
    if (availableYears.length > 0 && !selectedHistoricalYear) {
      selectedHistoricalYear = availableYears[0]; // Año más reciente
    }

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
  // Cambio de año para la sección histórica (no para la sección actual)
  const yearSelector = document.getElementById('year-selector');
  if (yearSelector) {
    yearSelector.addEventListener('change', (e) => {
      selectedHistoricalYear = parseInt(e.target.value);
      renderHistoricalTable(historicalTableContainer, selectedHistoricalYear, historicalTab);
    });
  }
  
  // Tabs para rankings históricos
  const driversTabBtn = document.getElementById('tab-drivers');
  const constructorsTabBtn = document.getElementById('tab-constructors');
  
  if (driversTabBtn) {
    driversTabBtn.addEventListener('click', () => {
      if (historicalTab !== 'drivers') {
        historicalTab = 'drivers';
        driversTabBtn.classList.add('active');
        constructorsTabBtn.classList.remove('active');
        renderHistoricalTable(historicalTableContainer, selectedHistoricalYear, 'drivers');
      }
    });
  }
  
  if (constructorsTabBtn) {
    constructorsTabBtn.addEventListener('click', () => {
      if (historicalTab !== 'constructors') {
        historicalTab = 'constructors';
        constructorsTabBtn.classList.add('active');
        driversTabBtn.classList.remove('active');
        renderHistoricalTable(historicalTableContainer, selectedHistoricalYear, 'constructors');
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
    if (nextRaceContainer) {
      await renderNextRace(nextRaceContainer);
    }
    
    // Renderizar previsualización de rankings DE ESTE AÑO (no el año seleccionado en el histórico)
    if (driverStandingsPreview && constructorStandingsPreview) {
      renderStandingsPreview(driverStandingsPreview, constructorStandingsPreview, displayYear);
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