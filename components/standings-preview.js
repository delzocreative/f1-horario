import { getFlagUrl, getCountryCode } from '../utils/flags.js';
import { getDriverStandings, getConstructorStandings } from '../api/client.js';

// Esta función renderiza los rankings del año anterior al actual (si estamos en 2026, muestra 2025)
export function renderStandingsPreview(driverContainer, constructorContainer, year = null) {
  // Si no se provee un año, usamos el año anterior al actual
  const displayYear = year !== null ? year : new Date().getFullYear() - 1;

  // Mostrar skeletons mientras cargan los datos
  renderDriverSkeleton(driverContainer, displayYear);
  renderConstructorSkeleton(constructorContainer, displayYear);

  // Fetch data
  Promise.all([
    getDriverStandings(displayYear),
    getConstructorStandings(displayYear)
  ])
  .then(([driverStandings, constructorStandings]) => {
    renderDriverStandings(driverContainer, driverStandings, displayYear);
    renderConstructorStandings(constructorContainer, constructorStandings, displayYear);
  })
  .catch(error => {
    console.error('Error loading standings:', error);
    driverContainer.innerHTML = `<h3 class="card-title">🏆 Pilotos (${displayYear})</h3><p>Error cargando datos</p>`;
    constructorContainer.innerHTML = `<h3 class="card-title">🔧 Constructores (${displayYear})</h3><p>Error cargando datos</p>`;
  });
}

function renderDriverSkeleton(container, year) {
  const displayYear = year || (new Date().getFullYear() - 1);
  container.innerHTML = `
    <div class="skeleton">
      <h3 class="card-title">🏆 Pilotos (${displayYear})</h3>
      <div class="skeleton-list">
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      </div>
      <div class="skeleton-button"></div>
    </div>
  `;
}

function renderConstructorSkeleton(container, year) {
  const displayYear = year || (new Date().getFullYear() - 1);
  container.innerHTML = `
    <div class="skeleton">
      <h3 class="card-title">🔧 Constructores (${displayYear})</h3>
      <div class="skeleton-list">
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      </div>
      <div class="skeleton-button"></div>
    </div>
  `;
}

function renderDriverStandings(container, driverStandings, year) {
  if (!driverStandings || !Array.isArray(driverStandings)) {
    container.innerHTML = `<h3 class="card-title">🏆 Pilotos (${year})</h3><p>No hay datos disponibles</p>`;
    return;
  }

  container.innerHTML = `
    <h3 class="card-title">🏆 Pilotos (${year})</h3>
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
  `;
}

function renderConstructorStandings(container, constructorStandings, year) {
  if (!constructorStandings || !Array.isArray(constructorStandings)) {
    container.innerHTML = `<h3 class="card-title">🔧 Constructores (${year})</h3><p>No hay datos disponibles</p>`;
    return;
  }

  container.innerHTML = `
    <h3 class="card-title">🔧 Constructores (${year})</h3>
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
  `;
}

function renderDriverSkeleton(container) {
  container.innerHTML = `
    <div class="skeleton">
      <h3 class="card-title">🏆 Pilotos (Año Actual)</h3>
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
      <h3 class="card-title">🔧 Constructores (Año Actual)</h3>
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
    container.innerHTML = '<h3 class="card-title">🏆 Pilotos (Año Actual)</h3><p>No hay datos disponibles</p>';
    return;
  }

  container.innerHTML = `
    <h3 class="card-title">🏆 Pilotos (${year || new Date().getFullYear()})</h3>
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
  `;
}

function renderConstructorStandings(container, constructorStandings, year = null) {
  if (!constructorStandings || !Array.isArray(constructorStandings)) {
    container.innerHTML = '<h3 class="card-title">🔧 Constructores (Año Actual)</h3><p>No hay datos disponibles</p>';
    return;
  }

  container.innerHTML = `
    <h3 class="card-title">🔧 Constructores (${year || new Date().getFullYear()})</h3>
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
  `;
}