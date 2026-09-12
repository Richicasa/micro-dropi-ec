// ==============================================================================
// UTILIDADES GEOGRÁFICAS Y VALIDACIONES OFICIALES PARA ECUADOR
// ==============================================================================

export interface Canton {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  code: string; // Código de 2 dígitos de la provincia (01 a 24)
  cantons: string[];
}

export const ECUADOR_PROVINCES: Province[] = [
  {
    id: "pichincha",
    name: "Pichincha",
    code: "17",
    cantons: [
      "Quito",
      "Cayambe",
      "Mejía (Machachi)",
      "Pedro Moncayo (Tabacundo)",
      "Pedro Vicente Maldonado",
      "Puerto Quito",
      "Rumiñahui (Sangolquí)",
      "San Miguel de los Bancos"
    ]
  },
  {
    id: "guayas",
    name: "Guayas",
    code: "09",
    cantons: [
      "Guayaquil",
      "Durán",
      "Samborondón",
      "Daule",
      "Milagro",
      "Salitre",
      "Naranjal",
      "Naranjito",
      "Balzar",
      "El Empalme",
      "El Triunfo",
      "Playas (General Villamil)",
      "Pedro Carbo",
      "Balao",
      "Colimes",
      "Palestina",
      "Santa Lucía",
      "Yaguachi",
      "Bucay"
    ]
  },
  {
    id: "azuay",
    name: "Azuay",
    code: "01",
    cantons: [
      "Cuenca",
      "Gualaceo",
      "Paute",
      "Santa Isabel",
      "Chordeleg",
      "Sigsig",
      "Girón",
      "San Fernando",
      "Nabón",
      "Pucará",
      "Oña",
      "Guachapala",
      "El Pan",
      "Sevilla de Oro",
      "Camilo Ponce Enríquez"
    ]
  },
  {
    id: "manabi",
    name: "Manabí",
    code: "13",
    cantons: [
      "Portoviejo",
      "Manta",
      "Chone",
      "Montecristi",
      "Jipijapa",
      "Sucre (Bahía de Caráquez)",
      "El Carmen",
      "Pedernales",
      "Rocafuerte",
      "Tosagua",
      "Santa Ana",
      "Jaramijó",
      "Paján",
      "Calceta (Bolívar)",
      "San Vicente",
      "Puerto López",
      "Flavio Alfaro",
      "Jama"
    ]
  },
  {
    id: "tungurahua",
    name: "Tungurahua",
    code: "18",
    cantons: [
      "Ambato",
      "Baños de Agua Santa",
      "Pelileo",
      "Píllaro",
      "Cevallos",
      "Mocha",
      "Patate",
      "Quero",
      "Tisaleo"
    ]
  },
  {
    id: "el_oro",
    name: "El Oro",
    code: "07",
    cantons: [
      "Machala",
      "Pasaje",
      "Santa Rosa",
      "Huaquillas",
      "Arenillas",
      "Piñas",
      "Zaruma",
      "Portovelo",
      "Atahualpa",
      "Balsas",
      "Chilla",
      "El Guabo",
      "Marcabelí",
      "Las Lajas"
    ]
  },
  {
    id: "santo_domingo",
    name: "Santo Domingo de los Tsáchilas",
    code: "23",
    cantons: ["Santo Domingo", "La Concordia"]
  },
  {
    id: "los_rios",
    name: "Los Ríos",
    code: "12",
    cantons: [
      "Babahoyo",
      "Quevedo",
      "Buena Fe",
      "Ventanas",
      "Vinces",
      "Valencia",
      "Montalvo",
      "Mocache",
      "Baba",
      "Palenque",
      "Puebloviejo",
      "Urdaneta (Catarama)",
      "Quinsaloma"
    ]
  },
  {
    id: "loja",
    name: "Loja",
    code: "11",
    cantons: [
      "Loja",
      "Catamayo",
      "Cariamanga (Calvas)",
      "Macará",
      "Catacocha (Paltas)",
      "Saraguro",
      "Celica",
      "Alamor (Puyango)",
      "Chaguarpamba",
      "Espíndola (Amaluza)",
      "Gonzanamá",
      "Pindal",
      "Quilanga",
      "Sozoranga",
      "Zapotillo",
      "Olmedo"
    ]
  },
  {
    id: "chimborazo",
    name: "Chimborazo",
    code: "06",
    cantons: [
      "Riobamba",
      "Guano",
      "Alausí",
      "Colta",
      "Chambo",
      "Cumandá",
      "Guamote",
      "Pallatanga",
      "Penipe",
      "Chunchi"
    ]
  },
  {
    id: "imbabura",
    name: "Imbabura",
    code: "10",
    cantons: [
      "Ibarra",
      "Otavalo",
      "Cotacachi",
      "Antonio Ante (Atuntaqui)",
      "Pimampiro",
      "San Miguel de Urcuquí"
    ]
  },
  {
    id: "cotopaxi",
    name: "Cotopaxi",
    code: "05",
    cantons: [
      "Latacunga",
      "Salcedo",
      "Pujilí",
      "La Maná",
      "Saquisilí",
      "Sigchos",
      "Pangua (El Corazón)"
    ]
  },
  {
    id: "santa_elena",
    name: "Santa Elena",
    code: "24",
    cantons: ["Santa Elena", "La Libertad", "Salinas"]
  },
  {
    id: "esmeraldas",
    name: "Esmeraldas",
    code: "08",
    cantons: [
      "Esmeraldas",
      "Atacames",
      "Quinindé",
      "San Lorenzo",
      "Muisne",
      "Eloy Alfaro",
      "Rioverde"
    ]
  },
  {
    id: "carchi",
    name: "Carchi",
    code: "04",
    cantons: [
      "Tulcán",
      "Montúfar (San Gabriel)",
      "Bolívar",
      "Espejo (El Ángel)",
      "Mira",
      "San Pedro de Huaca"
    ]
  },
  {
    id: "canar",
    name: "Cañar",
    code: "03",
    cantons: ["Azogues", "Cañar", "La Troncal", "Biblián", "Déleg", "El Tambo", "Suscal"]
  },
  {
    id: "bolivar",
    name: "Bolívar",
    code: "02",
    cantons: ["Guaranda", "Chillanes", "Chimbo", "Echeandía", "San Miguel", "Caluma", "Las Naves"]
  },
  {
    id: "sucumbios",
    name: "Sucumbíos",
    code: "21",
    cantons: ["Lago Agrio (Nueva Loja)", "Shushufindi", "Cuyabeno", "Cascales", "Gonzalo Pizarro", "Putumayo", "Sucumbíos"]
  },
  {
    id: "orellana",
    name: "Orellana",
    code: "22",
    cantons: ["Francisco de Orellana (Coca)", "La Joya de los Sachas", "Loreto", "Aguarico"]
  },
  {
    id: "napo",
    name: "Napo",
    code: "15",
    cantons: ["Tena", "Archidona", "El Chaco", "Quijos (Baeza)", "Carlos Julio Arosemena Tola"]
  },
  {
    id: "pastaza",
    name: "Pastaza",
    code: "16",
    cantons: ["Puyo (Pastaza)", "Mera", "Santa Clara", "Arajuno"]
  },
  {
    id: "morona_santiago",
    name: "Morona Santiago",
    code: "14",
    cantons: ["Macas (Morona)", "Gualaquiza", "Sucúa", "Limón Indanza", "Santiago de Méndez", "Palora", "Taisha", "Tiwintza", "San Juan Bosco", "Huamboya", "Logroño", "Pablo Sexto"]
  },
  {
    id: "zamora_chinchipe",
    name: "Zamora Chinchipe",
    code: "19",
    cantons: ["Zamora", "Yantzaza", "El Pangui", "Centinela del Cóndor", "Chinchipe (Zumba)", "Nangaritza", "Palanda", "Paquisha", "Yacuambi"]
  },
  {
    id: "galapagos",
    name: "Galápagos",
    code: "20",
    cantons: ["San Cristóbal", "Santa Cruz", "Isabela"]
  }
];

/**
 * Validación algorítmica de Cédula de Identidad Ecuatoriana (Módulo 10).
 * 
 * Reglas:
 * 1. Debe tener exactamente 10 dígitos numéricos.
 * 2. Los dos primeros dígitos corresponden a la provincia (01 - 24, o 30 para ecuatorianos en el exterior).
 * 3. El tercer dígito debe ser menor a 6 (personas naturales).
 * 4. Multiplicadores [2, 1, 2, 1, 2, 1, 2, 1, 2].
 * 5. Si el producto >= 10, se resta 9.
 * 6. Dígito verificador = (10 - (suma % 10)) % 10.
 * 7. Debe coincidir con el 10mo dígito.
 */
export function validateEcuadorianCedula(cedula: string): { isValid: boolean; error?: string } {
  const clean = cedula.trim().replace(/\D/g, "");

  if (clean.length !== 10) {
    return { isValid: false, error: "La cédula debe contener exactamente 10 dígitos." };
  }

  const provinceCode = parseInt(clean.substring(0, 2), 10);
  if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) {
    return { isValid: false, error: "Los dos primeros dígitos no corresponden a una provincia válida de Ecuador." };
  }

  const thirdDigit = parseInt(clean[2], 10);
  if (thirdDigit >= 6) {
    return { isValid: false, error: "El tercer dígito de una cédula de persona natural debe ser menor a 6." };
  }

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let val = parseInt(clean[i], 10) * coefficients[i];
    if (val >= 10) {
      val -= 9;
    }
    sum += val;
  }

  const calculatedVerifier = (10 - (sum % 10)) % 10;
  const providedVerifier = parseInt(clean[9], 10);

  if (calculatedVerifier !== providedVerifier) {
    return { isValid: false, error: "El número de cédula es inválido (dígito verificador incorrecto)." };
  }

  return { isValid: true };
}

/**
 * Validación y normalización de número de celular de Ecuador.
 * Formatos válidos:
 * - 0987654321 (10 dígitos empezando con 09)
 * - +593987654321 / 593987654321 (código de país Ecuador)
 */
export function validateEcuadorianPhone(phone: string): { isValid: boolean; formatted: string; error?: string } {
  let clean = phone.trim().replace(/[\s\-\(\)]/g, "");

  // Si empieza con +593
  if (clean.startsWith("+593")) {
    clean = clean.substring(4);
  } else if (clean.startsWith("593")) {
    clean = clean.substring(3);
  }

  // Si empieza con 09 (ej. 0991234567) -> quitar el 0
  if (clean.startsWith("0")) {
    clean = clean.substring(1);
  }

  // Ahora debe ser de 9 dígitos y empezar con 9 (ej. 991234567)
  if (clean.length !== 9 || !clean.startsWith("9")) {
    return {
      isValid: false,
      formatted: phone,
      error: "Número celular ecuatoriano inválido. Debe ser formato 09xxxxxxxx o +593 9xxxxxxxx."
    };
  }

  const internationalFormat = `+593${clean}`;
  return { isValid: true, formatted: internationalFormat };
}
