const DEFAULT_API_URL = 'http://localhost:3000';

export function backendOrigin(): string {
  return (process.env.API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}
