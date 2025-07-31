import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWhatsApp(value: string): string {
  // Remove todos os caracteres não numéricos
  let numericValue = value.replace(/\D/g, "");
  
  // SEMPRE limita a 11 dígitos
  numericValue = numericValue.substring(0, 11);
  
  // Aplica formatação baseada no comprimento
  if (numericValue.length > 6) {
    numericValue = numericValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (numericValue.length > 2) {
    numericValue = numericValue.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  } else if (numericValue.length > 0) {
    numericValue = numericValue.replace(/(\d{0,2})/, "($1");
  }
  
  return numericValue;
}
