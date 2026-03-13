import { getFlagUrl, getCountryCode } from '../utils/flags.js';
import { getDriverStandings, getConstructorStandings } from '../api/client.js';

export function renderStandingsPreview(driverContainer, constructorContainer, year = null) {
  // Mostrar skeletons mientras cargan los datos
  renderDriverSkeleton(driverContainer);
  renderConstructorSkeleton(constructorContainer);

  // Fetch data
  Promise.all([
    getDriverStandings(year),
    getConstructorStandings(year)
  ])
  .then(([driverStandings, constructorStandings]) => {
    renderDriverStandings(driverContainer, driverStandings, year);
    renderConstructorStandings(constructorContainer, constructorStandings, year);
  })
  .catch(error => {
    console.error('Error loading standings:', error);
    driverContainer.innerHTML = '<p>Error cargando datos</p>';
    constructorContainer.innerHTML = '<p>Error cargando datos</p>';
  });
}

function renderDriverSkeleton(container) {
  container.innerHTML = `
    <div class="skeleton">
      <h3 class="card-title">🏆 Pilotos</h3>
      <div class="skeleton-list">
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      </div>
      <div class="skeleton-button"></div>
    </div>
  `;
}

function renderConstructorSkeleton(container) {
  container.innerHTML = `
    <div class="skeleton">
      <h3 class="card-title">🔧 Constructores</h3>
      <div class="skeleton-list">
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      </div>
      <div class="skeleton-button"></div>
    </div>
  `;
}

function renderDriverStandings(container, driverStandings, year = null) {
  if (!driverStandings || !Array.isArray(driverStandings)) {
    container.innerHTML = '<p>No hay datos disponibles</p>';
    return;
  }

  container.innerHTML = `
    <h3 class="card-title">🏆 Pilotos</h3>
    <div class="standings-list">
      ${driverStandings.slice(0, 3).map((standing, idx) => {
        const position = parseInt(standing.position);
        const driver = standing.Driver;
        const nationalityCode = getCountryCode(driver.nationality);
        
        let rankClass = 'rank-normal';
        if (position === 1) rankClass = 'rank-gold';
        else if (position === 2) rankClass = 'rank-silver';
        else if (position === 3) rankClass = 'rank-bronze';
        
        return `
          <div class="driver-item">
            <div class="driver-rank ${rankClass}">${position}</div>
            <div>
              <div class="driver-name">${driver.givenName} ${driver.familyName}</div>
              <div class="driver-nationality">
                <img src="${getFlagUrl(nationalityCode, 16)}" alt="${driver.nationality}" width="16" height="11" onerror="this.src='https://flagcdn.com/w16/xx.png'" />
              </div>
            </div>
            <div class="driver-points">${standing.points} pts</div>
          </div>
        `;
      }).join('')}
    </div>
    <a href="#historical-table-container" class="standing-more-link" onclick="switchTab('drivers')">→ Ver ranking completo</a>
  `;
}

function renderConstructorStandings(container, constructorStandings, year = null) {
  if (!constructorStandings || !Array.isArray(constructorStandings)) {
    container.innerHTML = '<p>No hay datos disponibles</p>';
    return;
  }

  container.innerHTML = `
    <h3 class="card-title">🔧 Constructores</h3>
    <div class="standings-list">
      ${constructorStandings.slice(0, 3).map((standing, idx) => {
        const position = parseInt(standing.position);
        const constructor = standing.Constructor;
        const nationalityCode = getCountryCode(constructor.nationality);
        
        let rankClass = 'rank-normal';
        if (position === 1) rankClass = 'rank-gold';
        else if (position === 2) rankClass = 'rank-silver';
        else if (position === 3) rankClass = 'rank-bronze';
        
        return `
          <div class="constructor-item">
            <div class="constructor-rank ${rankClass}">${position}</div>
            <div class="constructor-name">${constructor.name}</div>
            <div class="constructor-points">${standing.points} pts</div>
            <div class="constructor-nationality">
              <img src="${getFlagUrl(nationalityCode, 16)}" alt="${constructor.nationality}" width="16" height="11" onerror="this.src='https://flagcdn.com/w16/xx.png'" />
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <a href="#historical-table-container" class="standing-more-link" onclick="switchTab('constructors')">→ Ver ranking completo</a>
  `;
}

// Función para cambiar de pestaña en la tabla histórica
window.switchTab = function(tab) {
  const driverBtn = document.getElementById('tab-drivers');
  const constructorBtn = document.getElementById('tab-constructors');
  
  if (tab === 'drivers') {
    driverBtn.classList.add('active');
    constructorBtn.classList.remove('active');
  } else if (tab === 'constructors') {
    constructorBtn.classList.add('active');
    driverBtn.classList.remove('active');
  }
  
  // Hacer scroll hacia la sección de tablas
  document.getElementById('historical-table-container').scrollIntoView({
    behavior: 'smooth'
  });
};