import { getYears } from '../api/client.js';

export function renderHeader(year, onYearChange, onRefresh) {
  const yearSelector = document.getElementById('year-selector');
  const refreshBtn = document.getElementById('refresh-btn');
  
  if (yearSelector) {
    yearSelector.value = year;
  }
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', onRefresh);
  }
}

export async function populateYearSelector(defaultYear) {
  try {
    // Si ya existe el selector y tiene opciones, solo actualizamos el valor
    const yearSelector = document.getElementById('year-selector');
    if (!yearSelector) return [];
    
    // Evitar duplicados en la actualización
    if (yearSelector.children.length > 0) {
      yearSelector.value = defaultYear;
      return Array.from(yearSelector.options).map(option => parseInt(option.value));
    }
    
    const years = await getYears();
    
    // Limpiar selector
    yearSelector.innerHTML = '';
    
    // Añadir años
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      if (year === defaultYear) {
        option.selected = true;
      }
      yearSelector.appendChild(option);
    });
    
    return years;
  } catch (error) {
    console.error('Error populating year selector:', error);
    return [];
  }
}