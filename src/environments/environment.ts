const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const environment = {
  production: process.env.NODE_ENV === 'production',

  apiUrl: configuredApiUrl ? configuredApiUrl.replace(/\/$/, '') : '/api',
};
