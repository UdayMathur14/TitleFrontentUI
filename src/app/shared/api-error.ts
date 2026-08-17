import { HttpErrorResponse } from '@angular/common/http';

interface ApiProblem {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'API connection failed. Make sure the backend is running at http://localhost:5184.';

  const problem = error.error as ApiProblem | string | null;
  if (typeof problem === 'string' && problem.trim()) return problem;
  if (!problem || typeof problem !== 'object') return fallback;

  const validationMessage = problem.errors
    ? Object.values(problem.errors).flat().find(message => Boolean(message?.trim()))
    : undefined;
  return validationMessage || problem.detail || problem.title || fallback;
}
