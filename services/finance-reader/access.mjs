export function configuration(env) {
  const projectId = env.FIREBASE_PROJECT_ID?.trim();
  const bucket = env.FINANCE_BUCKET?.trim();
  const emails = (env.FINANCE_ALLOWED_EMAILS ?? '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  if (!projectId || !bucket || !emails.length || emails.some(x => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))) {
    throw new Error('Complete production authentication configuration is required');
  }
  if (env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Authentication emulators are prohibited');
  return {projectId, bucket, allowedEmails: new Set(emails), origin: 'https://j3d1.fm'};
}

export function permitted(claims, allowedEmails) {
  return claims?.email_verified === true
    && claims?.firebase?.sign_in_provider === 'google.com'
    && typeof claims.email === 'string'
    && allowedEmails.has(claims.email.toLowerCase());
}

export function createHandler({config, verifyToken, asset}) {
  const routes = new Set(['/v1/dashboard', '/v1/report.pdf', '/v1/manifest']);
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Vary', 'Origin');
    const send = (status, error) => {
      res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify({error}));
    };
    const origin = req.headers.origin;
    if (origin && origin !== config.origin) return send(403, 'Origin not allowed');
    if (origin === config.origin) res.setHeader('Access-Control-Allow-Origin', config.origin);
    let url;
    try {url = new URL(req.url, 'https://reader.invalid');}
    catch {return send(400, 'Invalid request');}
    const path = url.pathname;
    if (path === '/ready' && req.method === 'GET') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end('{"status":"ok"}');
    }
    if (!routes.has(path)) return send(404, 'Not found');
    if (req.method === 'OPTIONS') {
      if (req.headers['access-control-request-method'] !== 'GET') return send(405, 'Read only');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization');
      res.writeHead(204); return res.end();
    }
    if (req.method !== 'GET') return send(405, 'Read only');
    const token = /^Bearer ([^\s]+)$/.exec(req.headers.authorization ?? '')?.[1];
    if (!token || token.length > 16000) return send(401, 'Google sign-in required');
    let claims;
    try { claims = await verifyToken(token); } catch { return send(401, 'Invalid or expired sign-in'); }
    if (!permitted(claims, config.allowedEmails)) return send(403, 'This account does not have access');
    const release = url.searchParams.get('release');
    if (release !== null && !/^[a-f0-9]{64}$/.test(release)) return send(400, 'Invalid report version');
    try { await asset(path, res, release); }
    catch {
      if (!res.headersSent) send(503, 'Report temporarily unavailable');
      else res.destroy();
    }
  };
}
