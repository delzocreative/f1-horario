import { getFlagUrl, getCountryCode } from '../utils/flags.js';
import { getDriverStandings, getConstructorStandings } from '../api/client.js';

export function renderHistoricalTable(container, year, tab = 'drivers') {
  // Mostrar skeleton mientras carga
  container.innerHTML = `
    <div class="loading">
      <div class="skeleton-table">
        <div class="skeleton-table-row"></div>
        <div class="skeleton-table-row"></div>
        <div class="skeleton-table-row"></div>
        <div class="skeleton-table-row"></div>
        <div class="skeleton-table-row"></div>
      </div>
    </div>
  `;

  // Fetch de datos
  let promise;
  if (tab === 'drivers') {
    promise = getDriverStandings(year);
  } else {
    promise = getConstructorStandings(year);
  }

  promise.then(standings => {
    renderStandingsTable(container, standings, tab);
  }).catch(error => {
    console.error('Error loading historical standings:', error);
    container.innerHTML = '<p>Error cargando datos históricos</p>';
  });
}

function renderStandingsTable(container, standings, tab) {
  if (!standings || !Array.isArray(standings)) {
    container.innerHTML = '<p>No hay datos disponibles</p>';
    return;
  }

  if (tab === 'drivers') {
    renderDriversTable(container, standings);
  } else {
    renderConstructorsTable(container, standings);
  }
}

function renderDriversTable(container, drivers) {
  container.innerHTML = `
    <table class="standings-table">
      <thead>
        <tr>
          <th class="sortable" onclick="sortTable(0)">Pos</th>
          <th class="sortable" onclick="sortTable(1)">Piloto</th>
          <th class="sortable" onclick="sortTable(2)">Nacionalidad</th>
          <th class="sortable" onclick="sortTable(3)">Puntos</th>
          <th class="sortable" onclick="sortTable(4)">Victorias</th>
        </tr>
      </thead>
      <tbody>
        ${drivers.map(driver => {
          const position = parseInt(driver.position);
          const driverData = driver.Driver;
          const nationalityCode = getCountryCode(driverData.nationality);
          
          let rankClass = '';
          if (position === 1) rankClass = ' gold';
          else if (position === 2) rankClass = ' silver';
          else if (position === 3) rankClass = ' bronze';
          
          return `
            <tr class="driver-row${rankClass}">
              <td>${driver.position}</td>
              <td>
                ${driverData.givenName} ${driverData.familyName}
                ${driverData.code ? ` (${driverData.code})` : ''}
              </td>
              <td>
                <img src="${getFlagUrl(nationalityCode, 20)}" alt="${driverData.nationality}" width="20" height="15" onerror="this.src='https://flagcdn.com/w20/xx.png'" />
                <span>${driverData.nationality}</span>
              </td>
              <td>${driver.points}</td>
              <td>${driver.wins || 0}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  // Agregar función de ordenación global
  window.sortTable = function(columnIndex) {
    const table = container.querySelector('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Determinar tipo de ordenamiento
    let isNumeric = columnIndex === 0 || columnIndex === 3 || columnIndex === 4; // Posición, Puntos, Victorias
    
    // Verificar si ya estaba ordenado en esta columna
    const currentSort = table.getAttribute('data-sort-column');
    const currentOrder = table.getAttribute('data-sort-order');
    
    let ascending = (currentSort == columnIndex) ? currentOrder !== 'asc' : true;
    
    // Actualizar atributos de orden
    table.setAttribute('data-sort-column', columnIndex);
    table.setAttribute('data-sort-order', ascending ? 'asc' : 'desc');
    
    // Remover clases anteriores de ordenación
    const headers = table.querySelectorAll('th');
    headers.forEach(header => header.classList.remove('sorted-asc', 'sorted-desc'));
    headers[columnIndex].classList.add(ascending ? 'sorted-asc' : 'sorted-desc');
    
    // Comparar función
    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex].textContent.trim();
      const bValue = b.cells[columnIndex].textContent.trim();
      
      if (isNumeric) {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return ascending ? aNum - bNum : bNum - aNum;
      } else {
        return ascending ? aValue.localeCompare(bValue, undefined, { numeric: true }) : bValue.localeCompare(aValue, undefined, { numeric: true });
      }
    });
    
    // Reinsertar filas en orden
    rows.forEach(row => tbody.appendChild(row));
  };
  
  // Aplicar estilos para filas de ganadores
  const rows = container.querySelectorAll('.driver-row');
  rows.forEach(row => {
    const position = parseInt(row.cells[0].textContent.trim());
    
    if (position === 1) {
      row.style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
      row.style.borderLeft = '3px solid var(--color-gold)';
    } else if (position === 2) {
      row.style.backgroundColor = 'rgba(156, 163, 175, 0.1)';
      row.style.borderLeft = '3px solid var(--color-silver)';
    } else if (position === 3) {
      row.style.backgroundColor = 'rgba(180, 83, 9, 0.1)';
      row.style.borderLeft = '3px solid var(--color-bronze)';
    }
  });
}

function renderConstructorsTable(container, constructors) {
  container.innerHTML = `
    <table class="standings-table">
      <thead>
        <tr>
          <th class="sortable" onclick="sortTable(0)">Pos</th>
          <th class="sortable" onclick="sortTable(1)">Constructor</th>
          <th class="sortable" onclick="sortTable(2)">Nacionalidad</th>
          <th class="sortable" onclick="sortTable(3)">Puntos</th>
          <th class="sortable" onclick="sortTable(4)">Victorias</th>
        </tr>
      </thead>
      <tbody>
        ${constructors.map(constructor => {
          const position = parseInt(constructor.position);
          const contractorData = constructor.Constructor;
          const nationalityCode = getCountryCode(contractorData.nationality);
          
          let rankClass = '';
          if (position === 1) rankClass = ' gold';
          else if (position === 2) rankClass = ' silver';
          else if (position === 3) rankClass = ' bronze';
          
          return `
            <tr class="constructor-row${rankClass}">
              <td>${constructor.position}</td>
              <td>${contractorData.name}</td>
              <td>
                <img src="${getFlagUrl(nationalityCode, 20)}" alt="${contractorData.nationality}" width="20" height="15" onerror="this.src='https://flagcdn.com/w20/xx.png'" />
                <span>${contractorData.nationality}</span>
              </td>
              <td>${constructor.points}</td>
              <td>${constructor.wins || 0}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  // Agregar función de ordenación global (ya está definida en drivers, pero la volvemos a agregar para evitar problemas)
  window.sortTable = function(columnIndex) {
    const table = container.querySelector('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Determinar tipo de ordenamiento
    let isNumeric = columnIndex === 0 || columnIndex === 3 || columnIndex === 4; // Posición, Puntos, Victorias
    
    // Verificar si ya estaba ordenado en esta columna
    const currentSort = table.getAttribute('data-sort-column');
    const currentOrder = table.getAttribute('data-sort-order');
    
    let ascending = (currentSort == columnIndex) ? currentOrder !== 'asc' : true;
    
    // Actualizar atributos de orden
    table.setAttribute('data-sort-column', columnIndex);
    table.setAttribute('data-sort-order', ascending ? 'asc' : 'desc');
    
    // Remover clases anteriores de ordenación
    const headers = table.querySelectorAll('th');
    headers.forEach(header => header.classList.remove('sorted-asc', 'sorted-desc'));
    headers[columnIndex].classList.add(ascending ? 'sorted-asc' : 'sorted-desc');
    
    // Comparar función
    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex].textContent.trim();
      const bValue = b.cells[columnIndex].textContent.trim();
      
      if (isNumeric) {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return ascending ? aNum - bNum : bNum - aNum;
      } else {
        return ascending ? aValue.localeCompare(bValue, undefined, { numeric: true }) : bValue.localeCompare(aValue, undefined, { numeric: true });
      }
    });
    
    // Reinsertar filas en orden
    rows.forEach(row => tbody.appendChild(row));
  };
  
  // Aplicar estilos para filas de ganadores
  const rows = container.querySelectorAll('.constructor-row');
  rows.forEach(row => {
    const position = parseInt(row.cells[0].textContent.trim());
    
    if (position === 1) {
      row.style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
      row.style.borderLeft = '3px solid var(--color-gold)';
    } else if (position === 2) {
      row.style.backgroundColor = 'rgba(156, 163, 175, 0.1)';
      row.style.borderLeft = '3px solid var(--color-silver)';
    } else if (position === 3) {
      row.style.backgroundColor = 'rgba(180, 83, 9, 0.1)';
      row.style.borderLeft = '3px solid var(--color-bronze)';
    }
  });
}