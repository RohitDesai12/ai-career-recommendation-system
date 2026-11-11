/**
 * Career Compass - Centralized JWT Configuration & Security
 * 
 * Enforces production security standards:
 * - In production: JWT_SECRET MUST be explicitly set to a secure, non-default string.
 *   Fails safely by throwing a fatal error if missing or using the insecure fallback.
 * - In development / testing: allows fallback for local developer ergonomics.
 */

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        if (!secret || secret === 'supersecretjwtkey_change_in_production' || secret.trim() === '') {
            throw new Error(
                'FATAL SECURITY ERROR: JWT_SECRET must be explicitly set to a secure secret in production. ' +
                'Default fallback secret is strictly prohibited.'
            );
        }
        return secret;
    }

    return secret || 'supersecretjwtkey_change_in_production';
}

module.exports = {
    getJwtSecret
};
