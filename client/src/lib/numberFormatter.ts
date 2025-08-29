export interface NumberFormatterOptions {
  minDecimals: number;
  maxDecimals: number;
  value: number | string | null | undefined;
  formatPattern: "0.000,00" | "0,000.00";
  roundMode: "up" | "down" | "truncate";
}

export type RoundMode = "up" | "down" | "truncate";
export type FormatPattern = "0.000,00" | "0,000.00";

export interface NumberFormatterOptions {
  minDecimals: number;
  maxDecimals: number;
  value: number | string | null | undefined;
  formatPattern: FormatPattern;
  roundMode: RoundMode;
}

 export function formatNumber({
   minDecimals,
   maxDecimals,
   value,
   formatPattern,
   roundMode,
 }: NumberFormatterOptions): string {
   // Validar y convertir a número
   let num: number;

   if (
     value === null ||
     value === undefined ||
     (typeof value === "string" && value.trim() === "") ||
     (typeof value === "string" && isNaN(Number(value))) ||
     (typeof value === "number" && isNaN(value))
   ) {
     num = 0;
   } else {
     num = typeof value === "number" ? value : Number(value);
   }

   const isNegative = num < 0;
   let absNum = Math.abs(num);

   // Separadores según patrón
   const thousandsSeparator = formatPattern === "0.000,00" ? "." : ",";
   const decimalSeparator = formatPattern === "0.000,00" ? "," : ".";

   // Detectar decimales originales
   const valueStr = absNum.toString();
   const decimalPos = valueStr.indexOf(".");
   const originalDecimals = decimalPos === -1 ? 0 : valueStr.length - decimalPos - 1;

   // Decimales a mostrar: entre min y max, o original si está dentro
   const decimalsToShow =
     originalDecimals < minDecimals
       ? minDecimals
       : originalDecimals > maxDecimals
       ? maxDecimals
       : originalDecimals;

   // Aplicar redondeo/truncado solo si originalDecimals > maxDecimals
   const factor = Math.pow(10, maxDecimals);
   if (originalDecimals > maxDecimals) {
     switch (roundMode) {
       case "up":
         absNum = Math.ceil(absNum * factor) / factor;
         break;
       case "down":
         absNum = Math.floor(absNum * factor) / factor;
         break;
       case "truncate":
         absNum = absNum >= 0
           ? Math.floor(absNum * factor) / factor
           : Math.ceil(absNum * factor) / factor;
         break;
     }
   }

   // Convertir con decimalsToShow para fijar cantidad decimales a mostrar mínimo
   let [integerPart, decimalPart = ""] = absNum
     .toFixed(decimalsToShow)
     .split(".");

   // Rellenar con ceros si es menos que minDecimals
   if (decimalPart.length < minDecimals) {
     decimalPart = decimalPart.padEnd(minDecimals, "0");
   }

   // Insertar separadores de miles en entero
   let intWithThousands = "";
   for (let i = integerPart.length - 1, count = 1; i >= 0; i--, count++) {
     intWithThousands = integerPart[i] + intWithThousands;
     if (count % 3 === 0 && i !== 0) {
       intWithThousands = thousandsSeparator + intWithThousands;
     }
   }

   // Construir resultado
   let result = intWithThousands;

   // Añadir parte decimal si corresponde
   if (minDecimals > 0 || decimalPart.length > 0) {
     result += decimalSeparator + decimalPart;
   }

   // Signo negativo si aplica
   if (isNegative && num !== 0) {
     result = "-" + result;
   }
  
   return result;
 }

