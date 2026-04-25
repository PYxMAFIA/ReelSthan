function readClientEnv(name) {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

export function getRequiredClientEnv(name) {
  const value = readClientEnv(name);
  if (!value) {
    throw new Error(`Missing required frontend environment variable: ${name}`);
  }
  return value;
}

export function getApiBaseUrl() {
  const baseUrl = getRequiredClientEnv('VITE_API_BASE_URL').replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}
