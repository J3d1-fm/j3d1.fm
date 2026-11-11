import {createServer} from 'node:http';
import {pipeline} from 'node:stream/promises';
import {initializeApp, applicationDefault} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {Storage} from '@google-cloud/storage';
import {configuration, createHandler} from './access.mjs';

const config = configuration(process.env);
const app = initializeApp({credential: applicationDefault(), projectId: config.projectId});
const bucket = new Storage({projectId: config.projectId}).bucket(config.bucket);
const handler = createHandler({
  config,
  verifyToken: token => getAuth(app).verifyIdToken(token),
  asset: async (path, res, requestedRelease) => {
    let current;
    if (path === '/v1/manifest' || !requestedRelease) {
      const [bytes] = await bucket.file('current.json').download();
      current = JSON.parse(bytes.toString('utf8'));
      if (!/^[a-f0-9]{64}$/.test(current.release) || !/^\d{4}-\d{2}-\d{2}$/.test(current.asOf)) throw new Error('Invalid release');
    }
    if (path === '/v1/manifest') {
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      return res.end(JSON.stringify({asOf: current.asOf, version: current.version, release: current.release}));
    }
    const dashboard = path === '/v1/dashboard';
    const filename = dashboard ? 'dashboard.html.gz' : 'report.pdf';
    const file = bucket.file(`releases/${requestedRelease ?? current.release}/${filename}`);
    // Check existence before starting the response; no signed/public object URLs.
    await file.getMetadata();
    res.setHeader('Content-Type', dashboard ? 'text/html; charset=utf-8' : 'application/pdf');
    if (dashboard) res.setHeader('Content-Encoding', 'gzip');
    else res.setHeader('Content-Disposition', 'attachment; filename="DZO_GTR_daily.pdf"');
    await pipeline(file.createReadStream({decompress: false}), res);
  },
});
createServer(handler).listen(Number(process.env.PORT || 8080), '0.0.0.0');
