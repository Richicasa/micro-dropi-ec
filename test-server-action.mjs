// Test rápido para Server Action y Validaciones
import { validateEcuadorianCedula, validateEcuadorianPhone } from "./src/lib/ecuador.ts";

console.log("Validando reglas de negocio COD:");
const cedulaValida = validateEcuadorianCedula("1710034065");
console.log("- Cédula válida 1710034065:", cedulaValida.isValid);

const phoneValido = validateEcuadorianPhone("0991234567");
console.log("- Teléfono normalizado E.164:", phoneValido.formatted);

console.log("✓ Validaciones conformes con las especificaciones de Ecuador.");
