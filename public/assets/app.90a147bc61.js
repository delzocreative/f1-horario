const CONFIG = {
  TTL: { RACE: 8 * 60 * 60 * 1000, WEATHER: 4 * 60 * 60 * 1000 },
  AUTO_REFRESH: 8 * 60 * 60 * 1000
};

// The Worker (worker/) is the source of race data (GET /next-race, itself
// cached from Jolpica — see worker/src/index.js) and push subscriptions.
// Filled in after deploying worker/ — see worker/README.md.
const WORKER_CONFIG = {
  // Production site talks to the prod Worker; anything else (Pages previews,
  // localhost) uses the dev Worker, whose CORS allows any origin. This
  // replaces the manual "flip the URL before merging" step.
  URL: location.hostname === 'f1-horario.com' ? 'https://api.f1-horario.com' : 'https://api.dev.f1-horario.com',
  // Must match the VAPID_PUBLIC_KEY of whichever Worker URL is picked above
  // (see worker/wrangler.toml, env.production / env.dev).
  VAPID_PUBLIC_KEY: location.hostname === 'f1-horario.com'
    ? 'BFMkwiGEXhdBNQEYY5ZK5dNms-lwbwuIJiJTR_lH9J8zHK3L4XJxL5_SPG9EPNS8ePgS81743kX5zxziqVAWb90'
    : 'BAXQhXGm-T-2hk5veGR7ZVA-eNb5t4UfakZwPwLDsxI4TrIQEYappTHUri-tEQGSIKeK-INIKk9hqLvRvHHd__4'
};

const SESSION_NAMES = {
  'FirstPractice': { name: 'Práctica 1', short: 'FP1', icon: '🏎️' },
  'SecondPractice': { name: 'Práctica 2', short: 'FP2', icon: '🏎️' },
  'ThirdPractice': { name: 'Práctica 3', short: 'FP3', icon: '🏎️' },
  'SprintQualifying': { name: 'Sprint Qualy', short: 'SQ', icon: '⚡' },
  'Sprint': { name: 'Sprint', short: 'Sprint', icon: '🏃' },
  'Qualifying': { name: 'Clasificación', short: 'Qualy', icon: '🎯' },
  'Race': { name: 'Carrera', short: 'Race', icon: '🏁' }
};

const SESSION_ORDER = ['FirstPractice', 'SecondPractice', 'SprintQualifying', 'Sprint', 'ThirdPractice', 'Qualifying', 'Race'];

const LATAM_COUNTRIES = [
  { code: 'ar', name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'bo', name: 'Bolivia', timezone: 'America/La_Paz' },
  { code: 'br', name: 'Brasil', timezone: 'America/Sao_Paulo' },
  { code: 'cl', name: 'Chile', timezone: 'America/Santiago' },
  { code: 'co', name: 'Colombia', timezone: 'America/Bogota' },
  { code: 'cr', name: 'Costa Rica', timezone: 'America/Costa_Rica' },
  { code: 'cu', name: 'Cuba', timezone: 'America/Havana' },
  { code: 'ec', name: 'Ecuador', timezone: 'America/Guayaquil' },
  { code: 'sv', name: 'El Salvador', timezone: 'America/El_Salvador' },
  { code: 'gt', name: 'Guatemala', timezone: 'America/Guatemala' },
  { code: 'hn', name: 'Honduras', timezone: 'America/Tegucigalpa' },
  { code: 'mx', name: 'Mexico', timezone: 'America/Mexico_City' },
  { code: 'ni', name: 'Nicaragua', timezone: 'America/Managua' },
  { code: 'pa', name: 'Panama', timezone: 'America/Panama' },
  { code: 'py', name: 'Paraguay', timezone: 'America/Asuncion' },
  { code: 'pe', name: 'Peru', timezone: 'America/Lima' },
  { code: 'do', name: 'Rep. Dominicana', timezone: 'America/Santo_Domingo' },
  { code: 'uy', name: 'Uruguay', timezone: 'America/Montevideo' },
  { code: 've', name: 'Venezuela', timezone: 'America/Caracas' }
];

const CIRCUIT_DATA = {
  'albert_park': { length: 5.278, laps: 58, turns: 16, opened: 1996, capacity: 125000, record: '1:19.813', holder: 'Charles Leclerc (2024)' },
  'bahrain': { length: 5.412, laps: 57, turns: 15, opened: 2004, capacity: 70000, record: '1:32.608', holder: 'Max Verstappen (2024)' },
  'shanghai': { length: 5.451, laps: 56, turns: 16, opened: 2004, capacity: 200000, record: '1:35.454', holder: 'Lando Norris (2025)' },
  'suzuka': { length: 5.807, laps: 53, turns: 18, opened: 1962, capacity: 155000, record: '1:30.965', holder: 'Kimi Antonelli (2025)' },
  'jeddah': { length: 6.174, laps: 50, turns: 27, opened: 2021, capacity: 50000, record: '1:31.632', holder: 'Charles Leclerc (2024)' },
  'miami': { length: 5.412, laps: 57, turns: 19, opened: 2022, capacity: 80000, record: '1:29.746', holder: 'Lando Norris (2025)' },
  'imola': { length: 4.909, laps: 63, turns: 17, opened: 1953, capacity: 60000, record: '1:17.988', holder: 'Max Verstappen (2025)' },
  'monaco': { length: 3.337, laps: 78, turns: 19, opened: 1929, capacity: 37000, record: '1:13.221', holder: 'Lando Norris (2025)' },
  'catalunya': { length: 4.657, laps: 66, turns: 16, opened: 1991, capacity: 140000, record: '1:15.743', holder: 'Oscar Piastri (2025)' },
  'villeneuve': { length: 4.361, laps: 70, turns: 14, opened: 1978, capacity: 100000, record: '1:14.119', holder: 'George Russell (2025)' },
  'red_bull_ring': { length: 4.318, laps: 71, turns: 10, opened: 1969, capacity: 105000, record: '1:06.200', holder: 'Max Verstappen (2021)' },
  'silverstone': { length: 5.891, laps: 52, turns: 18, opened: 1948, capacity: 150000, record: '1:27.369', holder: 'Lewis Hamilton (2019)' },
  'spa': { length: 7.004, laps: 44, turns: 19, opened: 1950, capacity: 70000, record: '1:44.701', holder: 'Sergio Perez (2024)' },
  'hungaroring': { length: 4.381, laps: 70, turns: 14, opened: 1986, capacity: 70000, record: '1:16.627', holder: 'Lewis Hamilton (2020)' },
  'zandvoort': { length: 4.259, laps: 72, turns: 14, opened: 1948, capacity: 100000, record: '1:12.271', holder: 'Oscar Piastri (2025)' },
  'monza': { length: 5.793, laps: 53, turns: 11, opened: 1922, capacity: 118000, record: '1:20.901', holder: 'Lando Norris (2025)' },
  'baku': { length: 6.003, laps: 51, turns: 20, opened: 2016, capacity: 28000, record: '1:43.009', holder: 'Charles Leclerc (2019)' },
  'marina_bay': { length: 4.940, laps: 62, turns: 19, opened: 2008, capacity: 80000, record: '1:33.808', holder: 'Lewis Hamilton (2025)' },
  'americas': { length: 5.513, laps: 56, turns: 20, opened: 2012, capacity: 120000, record: '1:36.169', holder: 'Charles Leclerc (2019)' },
  'rodriguez': { length: 4.304, laps: 71, turns: 17, opened: 1962, capacity: 110000, record: '1:17.774', holder: 'Valtteri Bottas (2021)' },
  'interlagos': { length: 4.309, laps: 71, turns: 15, opened: 1940, capacity: 60000, record: '1:10.540', holder: 'Valtteri Bottas (2018)' },
  'vegas': { length: 6.201, laps: 50, turns: 17, opened: 2023, capacity: 100000, record: '1:33.365', holder: 'Max Verstappen (2025)' },
  'losail': { length: 5.419, laps: 57, turns: 16, opened: 2004, capacity: 52000, record: '1:22.384', holder: 'Lando Norris (2024)' },
  'yas_marina': { length: 5.284, laps: 58, turns: 16, opened: 2009, capacity: 60000, record: '1:26.993', holder: 'Max Verstappen (2023)' }
};

const WIKI_CIRCUIT_MAP = {
  'albert_park': 'Albert_Park_Circuit', 'bahrain': 'Bahrain_International_Circuit',
  'shanghai': 'Shanghai_International_Circuit', 'suzuka': 'Suzuka_International_Racing_Course',
  'jeddah': 'Jeddah_Corniche_Circuit', 'miami': 'Miami_International_Autodrome',
  'imola': 'Imola_Circuit', 'monaco': 'Circuit_de_Monaco',
  'catalunya': 'Circuit_de_Barcelona-Catalunya', 'villeneuve': 'Circuit_Gilles_Villeneuve',
  'red_bull_ring': 'Red_Bull_Ring', 'silverstone': 'Silverstone_Circuit',
  'spa': 'Circuit_de_Spa-Francorchamps', 'hungaroring': 'Hungaroring',
  'zandvoort': 'Circuit_Zandvoort', 'monza': 'Monza_Circuit',
  'baku': 'Baku_City_Circuit', 'marina_bay': 'Marina_Bay_Street_Circuit',
  'americas': 'Circuit_of_the_Americas', 'rodriguez': 'Autodromo_Hermanos_Rodriguez',
  'interlagos': 'Interlagos_Circuit', 'vegas': 'Las_Vegas_Grand_Prix',
  'losail': 'Lusail_International_Circuit', 'yas_marina': 'Yas_Marina_Circuit'
};

const COUNTRY_NAME_MAP = {
  'Australia': 'au', 'Azerbaijan': 'az', 'Bahrain': 'bh', 'Belgium': 'be', 'Brazil': 'br',
  'Canada': 'ca', 'China': 'cn', 'France': 'fr', 'Germany': 'de', 'Hungary': 'hu',
  'Italy': 'it', 'Japan': 'jp', 'Mexico': 'mx', 'Monaco': 'mc', 'Netherlands': 'nl',
  'Portugal': 'pt', 'Qatar': 'qa', 'Saudi Arabia': 'sa', 'Singapore': 'sg', 'Spain': 'es',
  'UAE': 'ae', 'UK': 'gb', 'USA': 'us', 'Austria': 'at'
};

let state = { race: null, sessions: [], selectedCountry: null, countdownInterval: null, weather: {} };

const $ = id => document.getElementById(id);

function detectCountry() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const country = LATAM_COUNTRIES.find(c => c.timezone === timezone);
  const saved = localStorage.getItem('f1_selected_country');
  return (saved && LATAM_COUNTRIES.find(c => c.code === saved)) ? saved : (country?.code || 'ar');
}

function getFlagUrl(code, size = 40) {
  return `https://flagpedia.net/data/flags/w80/${code}.png`;
}

function formatTime(date, timezone) {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone });
}

function formatDay(date, timezone) {
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: timezone });
}

function getUTCOffset(timezone) {
  const now = new Date();
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const diff = (local - utc) / (60 * 60 * 1000);
  return `UTC${diff >= 0 ? '+' : ''}${diff}`;
}

function getCountryCode(countryName) {
  return COUNTRY_NAME_MAP[countryName] || 'xx';
}

function getCircuitWikiName(circuitId) {
  return WIKI_CIRCUIT_MAP[circuitId] || circuitId;
}

function getSessions(race) {
  const sessions = [];
  
  if (race.FirstPractice) {
    sessions.push({ key: 'FirstPractice', date: race.FirstPractice.date, time: race.FirstPractice.time });
  }
  if (race.SecondPractice) {
    sessions.push({ key: 'SecondPractice', date: race.SecondPractice.date, time: race.SecondPractice.time });
  }
  if (race.SprintQualifying) {
    sessions.push({ key: 'SprintQualifying', date: race.SprintQualifying.date, time: race.SprintQualifying.time });
  }
  if (race.Sprint) {
    sessions.push({ key: 'Sprint', date: race.Sprint.date, time: race.Sprint.time });
  }
  if (race.ThirdPractice) {
    sessions.push({ key: 'ThirdPractice', date: race.ThirdPractice.date, time: race.ThirdPractice.time });
  }
  if (race.Qualifying) {
    sessions.push({ key: 'Qualifying', date: race.Qualifying.date, time: race.Qualifying.time });
  }
  
  sessions.push({ key: 'Race', date: race.date, time: race.time });
  
  return sessions.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });
}

async function fetchRace() {
  const cacheKey = 'f1_race_data';
  const cacheTimeKey = 'f1_race_data_time';
  const cached = localStorage.getItem(cacheKey);
  const cacheTime = localStorage.getItem(cacheTimeKey);
  
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < CONFIG.TTL.RACE) {
    return JSON.parse(cached);
  }
  
  const response = await fetch(`${WORKER_CONFIG.URL}/next-race`);
  const nextRace = await response.json();

  if (!nextRace) return null;
  
  localStorage.setItem(cacheKey, JSON.stringify(nextRace));
  localStorage.setItem(cacheTimeKey, Date.now().toString());
  
  return nextRace;
}

async function fetchCircuitImage(circuitId) {
  const cacheKey = `f1_circuit_${circuitId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${getCircuitWikiName(circuitId)}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data?.thumbnail?.source) {
      localStorage.setItem(cacheKey, data.thumbnail.source);
      return data.thumbnail.source;
    }
  } catch (e) {}
  return null;
}

async function fetchWeather(city) {
  const cacheKey = `f1_weather_${city}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && (Date.now() - cached.time) < CONFIG.TTL.WEATHER) return cached.data;
  } catch (e) {}

  try {
    const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=es`);
    const data = await response.json();
    const forecast = {};
    
    if (data?.weather) {
      data.weather.forEach(day => {
        forecast[day.date] = {
          maxTemp: day.maxtempC,
          minTemp: day.mintempC,
          avgTemp: day.avgtempC,
          hourly: day.hourly
        };
      });
    }
    
    if (Object.keys(forecast).length) {
      try { localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data: forecast })); } catch (e) {}
    }

    return forecast;
  } catch (e) {
    return {};
  }
}

function getWeatherEmoji(weatherCode) {
  const code = parseInt(weatherCode);
  if (code === 113) return '☀️';
  if (code === 116) return '⛅';
  if (code === 119 || code === 122) return '☁️';
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 317, 320, 353, 356, 359].includes(code)) return '🌧️';
  if ([200, 386, 389, 392, 395].includes(code)) return '⛈️';
  if ([227, 230, 323, 326, 329, 332, 335, 338, 368, 371, 374, 377].includes(code)) return '❄️';
  if ([143, 248, 260].includes(code)) return '🌫️';
  return '🌡️';
}

function getWeatherForSession(dateStr, timeStr, weatherData) {
  if (!weatherData || Object.keys(weatherData).length === 0) {
    return null;
  }
  
  if (!weatherData[dateStr]) {
    return null;
  }
  
  const dayWeather = weatherData[dateStr];
  const hour = parseInt(timeStr.split(':')[0]);
  
  let closestHourly = dayWeather.hourly?.[0];
  let minDiff = 24;
  
  dayWeather.hourly?.forEach(h => {
    const hHour = parseInt(h.time) / 100;
    const diff = Math.abs(hHour - hour);
    if (diff < minDiff) {
      minDiff = diff;
      closestHourly = h;
    }
  });
  
  if (closestHourly) {
    return {
      temp: Number(closestHourly.tempC || dayWeather.avgTemp),
      emoji: getWeatherEmoji(closestHourly.weatherCode)
    };
  }
  
  return {
    temp: Number(dayWeather.avgTemp),
    emoji: '🌡️'
  };
}

function renderSchedule() {
  const countryData = LATAM_COUNTRIES.find(c => c.code === state.selectedCountry) || LATAM_COUNTRIES[0];
  const now = new Date();
  
  let nextSessionFound = false;
  
  const html = state.sessions.map(session => {
    const sessionDate = new Date(`${session.date}T${session.time}`);
    const isPast = sessionDate < now;
    const isNext = !isPast && !nextSessionFound;
    if (isNext) nextSessionFound = true;
    
    const info = SESSION_NAMES[session.key];
    const localTime = formatTime(sessionDate, countryData.timezone);
    const day = formatDay(sessionDate, countryData.timezone);
    const weather = getWeatherForSession(session.date, session.time, state.weather);
    
    return `
      <div class="session-row px-5 py-3 ${isNext ? 'next' : ''} ${isPast ? 'opacity-50' : ''}">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-lg">${info.icon}</span>
            <div>
              <p class="font-medium text-white ${session.key === 'Race' ? 'text-f1-red' : ''}">${info.name}</p>
              <p class="text-xs text-slate-400">${day}</p>
            </div>
          </div>
          <div class="text-right flex items-center gap-3">
            <p class="font-bold text-lg ${session.key === 'Race' ? 'text-f1-red' : 'text-white'}">${localTime}</p>
            ${weather && Number.isFinite(weather.temp) ? `<span class="text-sm">${weather.temp}°C ${weather.emoji}</span>` : ''}
            ${isNext ? '<p class="text-xs text-f1-red font-medium">Próxima</p>' : ''}
            ${isPast ? '<p class="text-xs text-slate-500">Finalizada</p>' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  $('schedule-list').innerHTML = html;
}

function renderRace() {
  if (!state.race) {
    $('main-content').innerHTML = '<p class="p-5 text-slate-400">No hay carreras programadas</p>';
    $('skeleton-loader').classList.add('hidden');
    $('main-content').classList.remove('hidden');
    return;
  }
  
  const race = state.race;
  const country = getCountryCode(race.Circuit.Location.country);
  const countryData = LATAM_COUNTRIES.find(c => c.code === state.selectedCountry) || LATAM_COUNTRIES[0];
  
  $('race-name').textContent = race.raceName;
  $('circuit-location').textContent = `${race.Circuit.circuitName}, ${race.Circuit.Location.locality}`;
  
  $('country-flag').src = getFlagUrl(country, 48);
  $('country-flag').onerror = () => $('country-flag').style.display = 'none';
  
  $('selected-flag').src = getFlagUrl(state.selectedCountry, 24);
  $('selected-flag').onerror = () => $('selected-flag').style.display = 'none';
  
  $('selected-country-short').textContent = countryData.code.toUpperCase();
  
  // Circuit image
  fetchCircuitImage(race.Circuit.circuitId).then(url => {
    if (url) {
      $('circuit-image').src = url;
      $('circuit-image').onerror = () => {
        $('circuit-image').classList.add('hidden');
        $('circuit-placeholder').classList.remove('hidden');
      };
    } else {
      $('circuit-image').classList.add('hidden');
      $('circuit-placeholder').classList.remove('hidden');
    }
  });
  
  // Circuit info
  const circuitInfo = CIRCUIT_DATA[race.Circuit.circuitId];
  if (circuitInfo) {
    $('track-length').textContent = `${circuitInfo.length} km`;
    $('track-turns').textContent = circuitInfo.turns;
    $('race-laps').textContent = circuitInfo.laps;
    $('track-opened').textContent = circuitInfo.opened;
    $('track-capacity').textContent = circuitInfo.capacity.toLocaleString();
    $('lap-record').textContent = circuitInfo.record;
    $('record-holder').textContent = circuitInfo.holder;
    $('circuit-info').classList.remove('hidden');
  }
  
  // Schedule
  renderSchedule();
  
  // Countdown
  const raceDate = new Date(`${race.date}T${race.time}`);
  startCountdown(raceDate);
  
  $('skeleton-loader').classList.add('hidden');
  $('main-content').classList.remove('hidden');
  
  // Load weather async
  setTimeout(() => {
    fetchWeather(race.Circuit.Location.locality).then(w => {
      if (w) {
        state.weather = w;
        renderSchedule();
      }
    });
  }, 500);
}

function startCountdown(targetDate) {
  if (state.countdownInterval) clearInterval(state.countdownInterval);
  
  function update() {
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      $('countdown').textContent = 'En vivo!';
      clearInterval(state.countdownInterval);
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let text = '';
    if (days > 0) text += `${days}d `;
    if (hours > 0 || days > 0) text += `${hours}h `;
    text += `${minutes}m`;
    
    $('countdown').textContent = text;
  }
  
  update();
  state.countdownInterval = setInterval(update, 60000);
}

function renderCountryList() {
  const race = state.race;
  if (!race) return;
  
  const raceDate = new Date(`${race.date}T${race.time}`);
  
  const html = LATAM_COUNTRIES.map(country => {
    const localTime = formatTime(raceDate, country.timezone);
    const isSelected = country.code === state.selectedCountry;
    
    return `
      <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors ${isSelected ? 'bg-slate-800 ring-1 ring-f1-red' : ''}" data-code="${country.code}">
        <img src="${getFlagUrl(country.code, 32)}" alt="${country.name}" class="w-8 h-6 rounded border border-slate-600 object-cover" data-flag />
        <div class="flex-1 text-left">
          <p class="font-medium text-white">${country.name}</p>
          <p class="text-xs text-slate-400">${getUTCOffset(country.timezone)}</p>
        </div>
        <p class="font-bold text-f1-red">${localTime}</p>
      </button>
    `;
  }).join('');
  
  $('country-list').innerHTML = html;

  // Was an inline onerror="" attribute; moved here so CSP can drop 'unsafe-inline'.
  $('country-list').querySelectorAll('img[data-flag]').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });
  
  $('country-list').querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.selectedCountry = btn.dataset.code;
      localStorage.setItem('f1_selected_country', state.selectedCountry);
      renderRace();
      closeModal();

      // Keep the FP1 "hora local" notification accurate for the new country.
      const sub = await getPushSubscription();
      if (sub) sendSubscriptionToWorker(sub);
    });
  });
}

function openModal() {
  renderCountryList();
  $('country-modal').showModal();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('country-modal').close();
  document.body.style.overflow = '';
}

async function refreshData() {
  localStorage.removeItem('f1_race_data');
  localStorage.removeItem('f1_race_data_time');
  
  $('main-content').classList.add('hidden');
  $('skeleton-loader').classList.remove('hidden');
  $('circuit-info').classList.add('hidden');
  
  try {
    state.race = await fetchRace();
    if (state.race) {
      state.sessions = getSessions(state.race);
    }
    renderRace();
  } catch (error) {
    console.error('Refresh failed:', error);
    $('main-content').innerHTML = '<p class="p-5 text-red-400">Error cargando datos</p>';
    $('skeleton-loader').classList.add('hidden');
    $('main-content').classList.remove('hidden');
  }
}

function setupAutoRefresh() {
  setInterval(() => {
    const lastRefresh = localStorage.getItem('f1_last_refresh');
    const now = Date.now();
    if (!lastRefresh || (now - parseInt(lastRefresh)) > CONFIG.AUTO_REFRESH) {
      refreshData();
      localStorage.setItem('f1_last_refresh', now.toString());
    }
  }, 60000);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

function pushSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

function isIosNonStandalone() {
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  return isIos && !isStandalone;
}

async function getPushSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

async function subscribeToPush() {
  if (isIosNonStandalone()) {
    alert('Para recibir notificaciones en iPhone, primero agregá esta app a tu pantalla de inicio (Compartir → Agregar a pantalla de inicio) y abrila desde ahí.');
    return;
  }
  if (!pushSupported()) {
    alert('Tu navegador no soporta notificaciones push.');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(WORKER_CONFIG.VAPID_PUBLIC_KEY)
  });

  await sendSubscriptionToWorker(sub);
  updateNotifyButton(true);
}

async function sendSubscriptionToWorker(sub) {
  try {
    await fetch(`${WORKER_CONFIG.URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...sub.toJSON(), country: state.selectedCountry })
    });
  } catch (e) {}
}

async function unsubscribeFromPush() {
  const sub = await getPushSubscription();
  if (sub) {
    try {
      await fetch(`${WORKER_CONFIG.URL}/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint })
      });
    } catch (e) {}
    await sub.unsubscribe();
  }
  updateNotifyButton(false);
}

function updateNotifyButton(subscribed) {
  const btn = $('notify-btn');
  if (!btn) return;
  btn.classList.toggle('text-f1-red', subscribed);
  btn.setAttribute('aria-pressed', subscribed ? 'true' : 'false');
  btn.title = subscribed ? 'Notificaciones activadas (clic para desactivar)' : 'Activar notificaciones';
}

async function initPush() {
  if (!pushSupported()) return;

  $('notify-btn').classList.remove('hidden');
  updateNotifyButton(!!(await getPushSubscription()));

  $('notify-btn').addEventListener('click', async () => {
    const sub = await getPushSubscription();
    if (sub) await unsubscribeFromPush();
    else await subscribeToPush();
  });

  // Chrome/Android fires this once the user finishes installing the PWA —
  // a natural moment to ask for notification permission, since installing
  // already signals intent to keep using the app. Not supported on iOS
  // Safari (no JS hook for "Add to Home Screen" there), so the bell above
  // stays as the only way to opt in on iOS, and as a manual fallback/toggle
  // everywhere else.
  window.addEventListener('appinstalled', () => {
    subscribeToPush();
  });
}

async function init() {
  state.selectedCountry = detectCountry();
  
  $('refresh-btn').addEventListener('click', refreshData);
  $('select-country-btn').addEventListener('click', openModal);
  $('close-modal').addEventListener('click', closeModal);
  
  $('country-modal').addEventListener('click', e => {
    if (e.target === $('country-modal')) closeModal();
  });
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('country-modal').open) closeModal();
  });
  
  try {
    state.race = await fetchRace();
    if (state.race) {
      state.sessions = getSessions(state.race);
    }
    renderRace();
  } catch (error) {
    console.error('Init failed:', error);
    $('main-content').innerHTML = '<p class="p-5 text-red-400">Error cargando datos</p>';
    $('skeleton-loader').classList.add('hidden');
    $('main-content').classList.remove('hidden');
  }
  
  setupAutoRefresh();
  
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  initPush();
}

document.addEventListener('DOMContentLoaded', init);
