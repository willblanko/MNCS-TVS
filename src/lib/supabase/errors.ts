export type FieldErrors = Record<string, string>

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Ocorreu um erro inesperado.'
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && 'message' in error)
    return String((error as { message: unknown }).message)
  return 'Ocorreu um erro inesperado.'
}

export function extractFieldErrors(_error: unknown): FieldErrors {
  return {}
}
