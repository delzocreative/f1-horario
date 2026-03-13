// Extraer nombre del circuito de la URL de Wikipedia
export async function getCircuitImageFromWikipedia(circuitName) {
  try {
    // Limpiar el nombre para formatear correctamente en la URL de Wikipedia
    const cleanName = circuitName.replace(/\s+/g, '_');
    
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${cleanName}`
    );
    const result = await response.json();
    
    if (result.thumbnail?.source) {
      return result.thumbnail.source;
    } 
    
    // Intentar con nombre alternativo (añadir 'Circuit')
    if (!result.pageid) {
      const circuitCleanName = circuitName.replace(/\s+/g, '_') + '_Circuit';
      const response2 = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${circuitCleanName}`
      );
      const result2 = await response2.json();
      
      if (result2.thumbnail?.source) {
        return result2.thumbnail.source;
      }
    }
    
    // Alternativa: devolver una imagen placeholder por defecto
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect fill="%231e293b" width="400" height="250"/><text fill="%2364748b" font-family="Arial" font-size="20" x="50" y="125">Imagen del circuito</text></svg>';
  } catch (error) {
    console.error('Error fetching circuit image:', error);
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect fill="%231e293b" width="400" height="250"/><text fill="%2364748b" font-family="Arial" font-size="20" x="50" y="125">Imagen del circuito</text></svg>';
  }
}

// Función para construir una mejor URL a partir del nombre del circuito
// ya que muchos nombres pueden no coincidir directamente con los títulos de Wikipedia
export function sanitizeCircuitName(name) {
  // Casos especiales
  const specialCases = {
    'Silverstone Circuit': 'Silverstone',
    'Circuit de la Sarthe': 'Bugatti_Circuit',
    'Circuit Gilles Villeneuve': 'Circuit_Gilles_Villeneuve',
    'Red Bull Ring – Spielberg': 'Red_Bull_Ring',
    'Autodromo Nazionale di Monza': 'Monza_National_Autodromo',
    'Circuit de Barcelona-Catalunya': 'Circuit_de_Barcelona-Catalunya',
    'Circuit Paul Ricard': 'Paul_Ricard_Circuit',
    'Circuit de Monaco': 'Circuit_de_Monaco',
    'Circuit des 24 Heures du Mans': 'Bugatti_Circuit',
    'Bahrain International Circuit': 'Bahrain_International_Circuit',
    'Miami International Autodrome': 'Miami_International_Autodrome',
    'Circuit de Nevers Magny-Cours': 'Magny-Cours',
    'Watkins Glen International': 'Watkins_Glen_International',
    'Indianapolis Motor Speedway': 'Indianapolis_Motor_Speedway',
    'Nürburgring': 'Nürburgring',
    'Hockenheimring': 'Hockenheimring',
    'Kyalami': 'Kyalami',
    'Long Beach Street Circuit': 'Long_Beach_Grand_Prix',
    'Detroit Grand Prix': 'Detroit_Grand_Prix',
    'Phoenix Grand Prix': 'Phoenix_Grand_Prix',
    'Donington Park': 'Donington_Park_Circuit',
    'Fuji Speedway': 'Fuji_Speedway',
    'Zandvoort': 'Circuit_Zandvoort',
    'Mosport International Raceway': 'Mosport_Park',
    'Clermont-Ferrand': 'Charade_Circuit'
  };
  
  return specialCases[name] || name;
}

// Obtener imagen de circuito con un método más flexible
export async function getCircuitImageUrl(circuitName) {
  try {
    const sanitized = sanitizeCircuitName(circuitName);
    const wikipediaName = sanitized.replace(/\s+/g, '_');
    
    // Intentamos diferentes posibles variantes
    const attempts = [
      wikipediaName,
      `${wikipediaName}_Circuit`,
      `${wikipediaName.replace(/_/g, ' ').split(' ')[0]}_Circuit`
    ];
    
    for (let attempt of attempts) {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${attempt}`
        );
        const result = await response.json();
        
        if (result.thumbnail?.source) {
          return result.thumbnail.source;
        }
      } catch (innerError) {
        // Siguientes intentos
        continue;
      }
    }
    
    // Si nada funciona, devolvemos imagen por defecto
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect fill="%231e293b" width="400" height="250"/><text fill="%2364748b" font-family="Arial" font-size="20" font-weight="bold" x="80" y="125">Circuito: ${encodeURIComponent(circuitName)}</text></svg>';
  } catch (error) {
    console.error('Error getting circuit image:', error);
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect fill="%231e293b" width="400" height="250"/><text fill="%2364748b" font-family="Arial" font-size="20" font-weight="bold" x="80" y="125">Circuito: ${encodeURIComponent(circuitName)}</text></svg>';
  }
}