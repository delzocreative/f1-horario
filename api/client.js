import { cache as cacheUtil } from '../utils/cache.js';

// Definir BASE_URL
const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// Definir TTLs
const TTL = {
  SCHEDULE: 120, // 2 horas
  STANDINGS: 120, // 2 horas
  YEARS: 1440 // 24 horas
};

/**
 * Función para hacer fetch a la API
 * @param {string} endpoint - la ruta del API
 * @param {string} cacheKey - clave para caché
 * @param {number} ttl - tiempo de vida en minutos
 * @returns {Promise<Object>} - respuesta de la API
 */
export async function fetchAPI(endpoint, cacheKey, ttl = 60) {
  try {
    // Intentar obtener del cache
    const cached = cacheUtil.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Hacer fetch a la API
    const response = await fetch(`${BASE_URL}${endpoint}.json`);
    
    if (!response.ok) {
      throw new Error(`Error de red: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Almacenar en cache si hay datos válidos
    if (data && Object.keys(data).length > 0) {
      cacheUtil.set(cacheKey, data, ttl);
    }
    
    return data;
  } catch (error) {
    console.error(`Error en fetchAPI para ${endpoint}:`, error);
    // Si no hay conexión, intentar recuperar del cache incluso si está expirado
    try {
      const fallback = localStorage.getItem('f1_dashboard:' + cacheKey);
      if (fallback) {
        return JSON.parse(fallback).data;
      }
    } catch (cacheError) {
      console.error('Error obteniendo datos del cache:', cacheError);
    }
    throw error;
  }
}

/**
 * Obtener carreras futuras
 * @param {number} [year] - Año a consultar, defaults to current year
 * @returns {Promise<Array>} - Lista de carreras
 */
export async function getNextRaces(year = null) {
  const targetYear = year || new Date().getFullYear();
  const cacheKey = `schedule:${targetYear}`;
  
  try {
    const data = await fetchAPI(`/${targetYear}`, cacheKey, TTL.SCHEDULE);
    
    if (!data || !data.MRData || !data.MRData.RaceTable || !data.MRData.RaceTable.Races) {
      console.warn('Estructura de datos inesperada para las carreras');
      return [];
    }
    
    const currentDate = new Date();
    let futureRaces = data.MRData.RaceTable.Races || [];
    
    // Filtrar carreras futuras usando solo la fecha, no la hora (debido a posibles discrepancias de zona horaria)  
    const nowUTC = new Date(); // Considerar la hora local convertida a UTC para filtro
    const timeZoneOffset = nowUTC.getTimezoneOffset() * 60000; // en milisegundos
    const localTimeInMS = nowUTC.getTime() - timeZoneOffset;
    
    let filteredRaces = [];
    for (const race of futureRaces) {
      // Crear una fecha combinando la fecha de carrera y la hora, y comparar con la actual
      const raceDateTime = new Date(`${race.date}T${race.time || "00:00:00Z"}`);
      
      // Si la fecha es hoy o en el futuro, incluirla
      if (raceDateTime.toISOString().substr(0, 10) >= new Date().toISOString().substr(0, 10)) {
        filteredRaces.push(race);
      }
    }
    
    // Ordenar por fecha
    filteredRaces.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    
    // Si no hay carreras futuras, tomar las últimas del año pasado
    if (filteredRaces.length === 0 && futureRaces.length > 0) {
      filteredRaces = [...futureRaces];
      filteredRaces.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)).splice(3);
    }
    
    return filteredRaces.slice(0, 5); // Máximo 5 carreras
  } catch (error) {
    console.error('Error obteniendo prÃ³ximas carreras:', error);
    return [];
  }
}

/**
 * Obtener clasificaci贸n de pilotos
 * @param {number} [year] - A帽o a consultar, defaults to current year
 * @returns {Promise<Array>} - Clasificaci贸n de pilotos
 */
export async function getDriverStandings(year = null) {
  const targetYear = year || new Date().getFullYear();
  const cacheKey = `standings:drivers:${targetYear}`;
  
  try {
    const data = await fetchAPI(`/${targetYear}/driverStandings`, cacheKey, TTL.STANDINGS);
    
    if (!data || !data.MRData || !data.MRData.StandingsTable || 
        !data.MRData.StandingsTable.StandingsLists ||
        !data.MRData.StandingsTable.StandingsLists[0]) {
      console.warn('Datos de clasificaci贸n de pilotos no encontrados o inv谩lidos');
      return [];
    }
    
    const standingsList = data.MRData.StandingsTable.StandingsLists[0];
    return standingsList.DriverStandings || [];
  } catch (error) {
    console.error('Error obteniendo clasificaci贸n de pilotos:', error);
    return [];
  }
}

/**
 * Obtener clasificaci贸n de constructores
 * @param {number} [year] - A帽o a consultar, defaults to current year
 * @returns {Promise<Array>} - Clasificaci贸n de constructores
 */
export async function getConstructorStandings(year = null) {
  const targetYear = year || new Date().getFullYear();
  const cacheKey = `standings:constructors:${targetYear}`;
  
  try {
    const data = await fetchAPI(`/${targetYear}/constructorStandings`, cacheKey, TTL.STANDINGS);
    
    if (!data || !data.MRData || !data.MRData.StandingsTable || 
        !data.MRData.StandingsTable.StandingsLists ||
        !data.MRData.StandingsTable.StandingsLists[0]) {
      console.warn('Datos de clasificaci贸n de constructores no encontrados o inv谩lidos');
      return [];
    }
    
    const standingsList = data.MRData.StandingsTable.StandingsLists[0];
    return standingsList.ConstructorStandings || [];
  } catch (error) {
    console.error('Error obteniendo clasificaci贸n de constructores:', error);
    return [];
  }
}

/**
 * Obtener todos los a帽os disponibles
 * @returns {Promise<Array<number>>} - Lista de a帽os
 */
export async function getYears() {
  const cacheKey = 'years';
  
  try {
    const data = await fetchAPI('/seasons', cacheKey, TTL.YEARS);
    
    if (!data || !data.MRData || !data.MRData.SeasonTable || !data.MRData.SeasonTable.Seasons) {
      console.warn('Datos de temporadas no encontrados o inv谩lidos');
      return [];
    }
    
    const seasons = data.MRData.SeasonTable.Seasons.map(season => parseInt(season.season));
    // Ordenar de forma descendente (m谩s reciente primero)
    return seasons.sort((a, b) => b - a);
  } catch (error) {
    console.error('Error obteniendo lista de a帽os:', error);
    // Devolver valores predeterminados si falla la petici贸n a la API
    const recentYears = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2020; i--) {
      recentYears.push(i);
    }
    return recentYears;
  }
}