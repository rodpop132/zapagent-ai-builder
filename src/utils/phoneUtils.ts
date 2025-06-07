
/**
 * Normaliza número de telefone removendo todos os caracteres não numéricos
 */
export function normalizarNumero(numero: string): string {
  if (!numero) return '';
  return numero.replace(/\D/g, '');
}

/**
 * Valida se um número normalizado tem pelo menos 10 dígitos
 */
export function validarNumero(numero: string): boolean {
  const numeroNormalizado = normalizarNumero(numero);
  return numeroNormalizado.length >= 10;
}

/**
 * Formata número para exibição (adiciona + no início)
 */
export function formatarNumeroParaExibicao(numero: string): string {
  const numeroNormalizado = normalizarNumero(numero);
  return numeroNormalizado ? `+${numeroNormalizado}` : '';
}
