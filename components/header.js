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
    const years = await getYears();
    
    const yearSelector = document.getElementById('year-selector');
    if (!yearSelector) return;
    
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