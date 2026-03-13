// Extraer nombre del circuito de la URL de Wikipedia
export async function getCircuitImageFromWikipedia(circuitName) {
  try {
    // Limpiar el nombre para formatear correctamente en la URL de Wikipedia
    const cleanedName = circuitName
                       .replace(/\s+/g, '_')
                       .replace(/[^\w\u00c0-\u017f_]/gi, '');
    
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${cleanedName}`,
      {
        headers: {
          'User-Agent': 'F1-Dashboard-LATAM/1.0 (contact@f1-dashboard.com)'
        }
      }
    );
    const result = await response.json();
    
    if (result.thumbnail?.source) {
      return result.thumbnail.source;
    } 
    
    // Intentar con nombre alternativo (añadir 'Circuit')
    if (!result.title) {
      const circuitCleanName = cleanedName + '_Circuit';
      try {
        const response2 = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${circuitCleanName}`,
          {
            headers: {
              'User-Agent': 'F1-Dashboard-LATAM/1.0 (contact@f1-dashboard.com)'
            }
          }
        );
        const result2 = await response2.json();
        
        if (result2.thumbnail?.source) {
          return result2.thumbnail.source;
        }
      } catch (error2) {
        // Si falla con circuito, ignorar error
      }
    }
    
    // Alternativa: devolver una imagen SVG placeholder genérica
    return getSVGPlaceholder(circuitName);
  } catch (error) {
    console.error('Error fetching circuit image:', error);
    return getSVGPlaceholder(circuitName);
  }
}

// Función para construir una imagen SVG de placeholder
function getSVGPlaceholder(circuitName) {
  // Codificar el nombre del circuito para colocarlo en la imagen SVG
  const encodedName = encodeURIComponent(circuitName);
  
  // Crear una imagen SVG con el nombre del circuito
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
      <rect width="400" height="200" fill="%231e293b"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="16" fill="%2364748b">
        ${encodedName}
      </text>
    </svg>
  `)}`;
}

// Obtener imagen de circuito con un método más flexible
export async function getCircuitImageUrl(circuitName) {
  try {
    const sanitized = sanitizeCircuitName(circuitName);
    const wikipediaName = sanitized
      .replace(/\s+/g, '_')
      .replace(/[^\w\u00c0-\u017f_]/gi, '');
    
    // Intentamos diferentes posibles variantes
    const attempts = [
      wikipediaName,
      `${wikipediaName}_Circuit`,
      `${wikipediaName}_Grand_Prix`,
      `${wikipediaName}_Racing_Circuit`,
      wikipediaName.split('_')[0] + '_Circuit' // Tratar solo la primera palabra como nombre de circuito
    ];
    
    for (let attempt of attempts) {
      try {
        if (!attempt || attempt.trim() === '') continue; // Saltar nombres vacíos
        
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${attempt}`,
          {
            headers: {
              'User-Agent': 'F1-Dashboard-LATAM/1.0 (contact@f1-dashboard.com)'
            }
          }
        );
        
        // Chequear que la respuesta está bien antes de intentar leerla
        if (!response.ok && response.status === 404) {
          continue; // Si no existe, intentar con el siguiente
        }
        
        const result = await response.json();
        
        if (result && result.thumbnail && result.thumbnail.source) {
          return result.thumbnail.source;
        }
      } catch (error) {
        // Siguiente intento
        continue;
      }
    }
    
    // Si nada funciona, devolvemos imagen por defecto
    return getSVGPlaceholder(circuitName);
  } catch (error) {
    console.error('Error getting circuit image:', error);
    return getSVGPlaceholder(circuitName);
  }
}

// Función para construir nombre Wikipedia con mayor tolerancia
export function sanitizeCircuitName(name) {
  // Casos especiales conocidos por los nombres comunes en la API
  const mappings = {
    'Albert Park Grand Prix Circuit': 'Albert_Park',
    'Bahrain International Circuit': 'Bahrain_International_Circuit',
    'Circuit de la Sarthe': 'Bugatti_Circuit', // Bugatti Circuit en Le Mans
    'Circuit Gilles Villeneuve': 'Circuit_Gilles_Villeneuve',
    'Red Bull Ring – Spielberg': 'Red_Bull_Ring',
    'Silverstone Circuit': 'Silverstone_Circuit',
    'Circuit de Barcelona-Catalunya': 'Circuit_de_Barcelona-Catalunya',
    'Hungaroring': 'Hungaroring',
    'Spa-Francorchamps': 'Circuit_de_Statte-Spa',
    'Autodromo Nazionale di Monza': 'Autodromo_Nazionale_di_Monza',
    'Sochi Autodrom': 'Sochi_Autodrom',
    'Marina Bay Street Circuit': 'Marina_Bay_Street_Circuit',
    'Circuit of the Americas': 'Circuit_of_the_Americas',
    'Autodromo Hermanos Rodriguez': 'Autodromo_Hermanos_Rodriguez',
    'Buddh International Circuit': 'Buddh_International_Circuit',
    'Sochi Autodrome': 'Sochi_Autodrom', // Variante ortográfica
    'Baku City Circuit': 'Baku_City_Circuit',
    'Rouen-Les-Essarts': 'Rouen_Les_Essarts',
    'Circuit Paul Ricard': 'Paul_Ricard_Circuit',
    'Adelaide Street Circuit': 'Adelaide_Street_Circuit',
    'Phoenix street circuit': 'Phoenix_Grand_Prix',
    'Detroit Street Circuit': 'Detroit_Grand_Prix',
    'Dallas Grand Prix': 'Dallas_Grand_Prix',
    'Jerez Circuit': 'Jerez', // Nombre corto
    'Estoril Circuit': 'Estoril_Circuit',
    'Fuji Speedway': 'Fuji_Speedway',
    'Kyalami Grand Prix Circuit': 'Kyalami',
    'Brands Hatch': 'Brands_Hatch',
    'Hockenheimring': 'Hockenheimring',
    'Österreichring': 'Österreichring',
    'Watkins Glen': 'Watkins_Glen_International',
    'Nürburgring': 'Nürburgring',
    'Charade Circuit': 'Circuit_Descartes',
    'Riverside International Raceway': 'Riverside_International_Raceway',
    'Circuit Mont-Tremblant': 'Circuit_Mont-Tremblant',
    'Cobblepot Circuit': 'Cobble_Pot',
    'Prince George Circuit': 'Prince_George_Circuit',
    'Long Beach Street Circuit': 'Long_Beach',
    'Dijon-Prenois Circuit': 'Dijon-Prenois',
    'Donington Park Circuit': 'Donington_Park_Circuit',
    'Imola Circuit': 'Autodromo_Enzo_e_Dino_Ferrari',
    'Phoenix Street Circuit': 'Phoenix_Grand_Prix',
    'Azerbaijan Grand Prix Baku City Circuit': 'Baku_City_Circuit'
  };
  
  // Verificar mapeo primero
  if (mappings[name]) {
    return mappings[name];
  }
  
  // Caso base - simplemente devolver nombre limpio
  return name.replace(/\s+/g, '_').replace(/[^\w\u00c0-\u017f_]/gi, '');
}