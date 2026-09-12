// Prueba de Validación Algorítmica de Cédula y Teléfono Ecuador
import { validateEcuadorianCedula, validateEcuadorianPhone } from "./src/lib/ecuador.ts";

console.log("--- TEST DE VALIDACIÓN ECUADOR ---");

// Cédula válida de prueba (Pichincha)
const testCedulaValida = "1710034065"; 
const r1 = validateEcuadorianCedula(testCedulaValida);
console.log(`Cédula ${testCedulaValida} (debe ser válida):`, r1.isValid);

// Cédula inválida (provincia incorrecta 35)
const testCedulaInvalidaProvincia = "3510034065";
const r2 = validateEcuadorianCedula(testCedulaInvalidaProvincia);
console.log(`Cédula ${testCedulaInvalidaProvincia} (provincia inválida):`, !r2.isValid);

// Cédula inválida (dígito verificador malo)
const testCedulaInvalidaDigito = "1710034069";
const r3 = validateEcuadorianCedula(testCedulaInvalidaDigito);
console.log(`Cédula ${testCedulaInvalidaDigito} (verificador malo):`, !r3.isValid);

// Teléfono celular
const t1 = validateEcuadorianPhone("0987654321");
console.log("Teléfono 0987654321:", t1.isValid, t1.formatted);

const t2 = validateEcuadorianPhone("+593 99 123 4567");
console.log("Teléfono +593 99 123 4567:", t2.isValid, t2.formatted);

const t3 = validateEcuadorianPhone("042123456"); // Fijo o no celular
console.log("Teléfono inválido 042123456:", !t3.isValid);

console.log("--- FIN PRUEBAS ---");
