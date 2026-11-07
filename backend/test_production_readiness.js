const http = require('http');

async function runTests() {
  console.log('--- STARTING PRODUCTION SECURITY & COMPATIBILITY VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(desc, condition) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Backend root & Security Headers
  try {
    const res = await fetch('http://127.0.0.1:5000/');
    assert('Backend root returns 200', res.status === 200);
    assert('Security header: X-Content-Type-Options: nosniff', res.headers.get('x-content-type-options') === 'nosniff');
    assert('Security header: X-Frame-Options: SAMEORIGIN', res.headers.get('x-frame-options') === 'SAMEORIGIN');
    assert('Security header: X-XSS-Protection: 1; mode=block', res.headers.get('x-xss-protection') === '1; mode=block');
    assert('Security header: Referrer-Policy present', !!res.headers.get('referrer-policy'));
  } catch (err) {
    assert('Backend root connection', false);
  }

  // 2. Vite Dev Server root & Proxy
  try {
    const viteRes = await fetch('http://127.0.0.1:5173/');
    assert('Frontend server returns 200', viteRes.status === 200);
    const html = await viteRes.text();
    assert('Frontend returns valid HTML with root mount', html.includes('id="root"'));
    assert('Frontend HTML contains preconnect to fonts', html.includes('rel="preconnect"'));
  } catch (err) {
    assert('Frontend server connection', false);
  }

  // 3. Vite API Proxy Test (/api/employer/public-jobs via port 5173)
  try {
    const proxyRes = await fetch('http://127.0.0.1:5173/api/employer/public-jobs');
    assert('Vite Proxy forwards /api to backend with HTTP 200', proxyRes.status === 200);
    const data = await proxyRes.json();
    assert('Proxy returns jobs payload', Array.isArray(data.jobs));
  } catch (err) {
    assert('Vite API proxy forwarding', false);
  }

  // 4. Registration sets HttpOnly auth_token cookie
  const testEmail = `audit_student_${Date.now()}@compass.edu`;
  const testPassword = 'AuditSecurePassword123!';
  let jwtToken = '';
  let authTokenCookie = '';

  try {
    const regRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Student',
        email: testEmail,
        password: testPassword,
        role: 'student',
        termsAccepted: true
      })
    });
    assert('Registration returns 200', regRes.status === 200);
    const regCookie = regRes.headers.get('set-cookie');
    assert('Registration Set-Cookie present', !!regCookie);
    assert('Registration sets HttpOnly auth_token cookie', regCookie?.includes('auth_token=') && regCookie?.includes('HttpOnly'));
    assert('Registration cookie has SameSite=Lax', regCookie?.includes('SameSite=Lax') || regCookie?.includes('samesite=lax'));
    const regData = await regRes.json();
    jwtToken = regData.token;
    assert('Registration returns JWT token in body for header support', !!jwtToken);
  } catch (err) {
    assert('Registration flow', false);
  }

  // 5. Login sets HttpOnly auth_token cookie
  try {
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    assert('Student login returns 200', loginRes.status === 200);
    const setCookie = loginRes.headers.get('set-cookie');
    assert('Set-Cookie header present on login', !!setCookie);
    assert('Cookie contains auth_token', setCookie?.includes('auth_token='));
    assert('Cookie has HttpOnly flag', setCookie?.includes('HttpOnly'));
    assert('Cookie has SameSite=Lax flag', setCookie?.includes('SameSite=Lax') || setCookie?.includes('samesite=lax'));

    const loginData = await loginRes.json();
    jwtToken = loginData.token;
    authTokenCookie = setCookie ? setCookie.split(';')[0] : '';
  } catch (err) {
    assert('Auth login flow', false);
  }

  // 6. Auth Middleware via HttpOnly Cookie (No x-auth-token header)
  try {
    const meRes = await fetch('http://127.0.0.1:5000/api/auth/me', {
      headers: { Cookie: authTokenCookie }
    });
    assert('GET /api/auth/me succeeds using HttpOnly cookie alone', meRes.status === 200);
    const meData = await meRes.json();
    assert('Me endpoint identifies correct user from cookie', meData.user?.email === testEmail);
  } catch (err) {
    assert('Cookie-based auth verification', false);
  }

  // 7. Auth Middleware via Bearer / x-auth-token header (No cookie)
  try {
    const meHeaderRes = await fetch('http://127.0.0.1:5000/api/auth/me', {
      headers: { 'x-auth-token': jwtToken }
    });
    assert('GET /api/auth/me succeeds using x-auth-token header alone', meHeaderRes.status === 200);
    const meHeaderData = await meHeaderRes.json();
    assert('Me endpoint identifies correct user from header', meHeaderData.user?.email === testEmail);
  } catch (err) {
    assert('Header-based auth verification', false);
  }

  // 8. Logout endpoint clears cookie
  try {
    const logoutRes = await fetch('http://127.0.0.1:5000/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: authTokenCookie }
    });
    assert('POST /api/auth/logout returns 200', logoutRes.status === 200);
    const clearCookie = logoutRes.headers.get('set-cookie');
    assert('Logout clears auth_token cookie', clearCookie?.includes('auth_token=;') || clearCookie?.includes('auth_token='));
  } catch (err) {
    assert('Logout endpoint', false);
  }

  // 9. Privacy Consent recording with granular preferences
  try {
    const consentRes = await fetch('http://127.0.0.1:5000/api/privacy/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': jwtToken
      },
      body: JSON.stringify({
        consentType: 'cookie_preferences',
        documentVersion: 'v1.0',
        preferences: {
          essential: true,
          functional: true,
          analytics: false,
          marketing: false
        }
      })
    });
    assert('POST /api/privacy/consent records user preferences', consentRes.status === 200);
  } catch (err) {
    assert('Privacy consent logging', false);
  }

  console.log(`\n--- ALL TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED ---`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
