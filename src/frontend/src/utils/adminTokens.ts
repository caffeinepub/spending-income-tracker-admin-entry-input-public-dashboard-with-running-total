import { getSecretParameter } from './urlParams';

/**
 * Admin token configuration for backend initialization
 * Returns non-empty tokens with safe fallbacks to ensure admin bootstrap works
 */
export interface AdminTokens {
  adminToken: string;
  userProvidedToken: string;
}

/**
 * Gets admin tokens with guaranteed non-empty values
 * Reads from URL hash/session via getSecretParameter, falls back to defaults
 * 
 * @returns Object with adminToken and userProvidedToken, both guaranteed non-empty
 */
export function getAdminTokens(): AdminTokens {
  const caffeineToken = getSecretParameter('caffeineAdminToken');
  
  // Use the token from URL/session if available, otherwise use safe defaults
  // These defaults ensure the backend's ensureInitialized function can work
  const adminToken = caffeineToken && caffeineToken.trim() !== '' 
    ? caffeineToken 
    : 'default-admin-token';
  
  const userProvidedToken = caffeineToken && caffeineToken.trim() !== '' 
    ? caffeineToken 
    : 'default-user-token';
  
  return {
    adminToken,
    userProvidedToken,
  };
}
