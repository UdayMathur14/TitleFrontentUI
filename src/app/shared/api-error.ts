import { HttpErrorResponse } from '@angular/common/http';

interface ApiProblem {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'API connection failed. Make sure the backend is running at http://localhost:5184.';
  if (error.status === 404 || error.status >= 500) return fallback;

  const problem = error.error as ApiProblem | string | null;
  if (typeof problem === 'string') return safeMessage(problem, fallback);
  if (!problem || typeof problem !== 'object') return fallback;

  const validationMessage = problem.errors
    ? Object.values(problem.errors).flat().find(message => Boolean(message?.trim()))
    : undefined;
  return safeMessage(validationMessage || problem.detail || problem.title, fallback);
}

function safeMessage(value: string | undefined, fallback: string): string {
  const message = value?.trim();
  if (!message) return fallback;

  const containsHtml = /<(?:!doctype|html|head|body|style|script|title)\b/i.test(message);
  if (containsHtml || message.length > 400) return fallback;

  const plainText = message.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plainText || fallback;
}
