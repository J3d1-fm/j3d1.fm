import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import test from 'node:test';
import {configuration, permitted, createHandler} from '../access.mjs';

const emails = ['ceo@example.com', 'owner@gmail.com', 'direct@example.com'];
const config = configuration({FIREBASE_PROJECT_ID: 'example', FINANCE_BUCKET: 'private', FINANCE_ALLOWED_EMAILS: emails.join(',')});
const claims = email => ({email, email_verified: true, firebase: {sign_in_provider: 'google.com'}});

test('production configuration fails closed', () => {
  for (const env of [{}, {FIREBASE_PROJECT_ID: 'x'}, {FIREBASE_PROJECT_ID: 'x', FINANCE_BUCKET: 'y'}]) assert.throws(() => configuration(env));
  assert.throws(() => configuration({FIREBASE_PROJECT_ID: 'x', FINANCE_BUCKET: 'y', FINANCE_ALLOWED_EMAILS: emails[0], FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099'}));
});
test('malformed request targets return 400 without an unhandled rejection', async () => {
  let status;
  const res = {setHeader(){}, writeHead(code){status=code;}, end(){}};
  const handler=createHandler({config,verifyToken:()=>{throw new Error('must not verify');},asset:()=>{throw new Error('must not read');}});
  await handler({url:'//[',method:'GET',headers:{}},res);
  assert.equal(status,400);
});
test('only the exact three verified Google addresses are allowed', () => {
  for (const email of emails) assert.equal(permitted(claims(email), config.allowedEmails), true);
  for (const email of ['someone@example.com', 'ceo+tag@example.com', 'direct@example.com.evil', 'someone@jetgamesdev.com']) assert.equal(permitted(claims(email), config.allowedEmails), false);
  assert.equal(permitted({...claims(emails[0]), email_verified: false}, config.allowedEmails), false);
  assert.equal(permitted({...claims(emails[0]), firebase: {sign_in_provider: 'password'}}, config.allowedEmails), false);
  assert.equal(permitted({...claims(emails[0]), firebase: {sign_in_provider: 'custom'}}, config.allowedEmails), false);
});
test('all report routes require a valid allowed identity and reject writes', async () => {
  let reads = 0; let selectedRelease;
  const server = createServer(createHandler({config, verifyToken: async token => {
    if (token === 'allowed') return claims(emails[1]);
    if (token === 'other') return claims('other@gmail.com');
    throw new Error('Invalid signature/audience/expiry');
  }, asset: async (_path, res, release) => {reads++; selectedRelease = release; res.end('private report');}}));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/v1/dashboard', '/v1/report.pdf', '/v1/manifest']) {
      for (const [token, expected] of [['',401],['invalid',401],['other',403]]) {
        const r = await fetch(url + path, {headers: token ? {Authorization: `Bearer ${token}`} : {}});
        assert.equal(r.status, expected); assert.doesNotMatch(await r.text(), /private report/);
      }
      const r = await fetch(url + path, {headers: {Authorization: 'Bearer allowed', Origin: 'https://j3d1.fm'}});
      assert.equal(r.status, 200); assert.match(r.headers.get('Cache-Control'), /no-store/);
      assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://j3d1.fm');
      for (const method of ['POST','PUT','PATCH','DELETE','HEAD']) assert.equal((await fetch(url+path,{method,headers:{Authorization:'Bearer allowed'}})).status,405);
    }
    assert.equal(reads,3);
    assert.equal((await fetch(url+'/v1/dashboard',{headers:{Authorization:'Bearer allowed',Origin:'https://evil.example'}})).status,403);
    assert.equal((await fetch(url+'/snapshot.json')).status,404);
    assert.equal((await fetch(url+'/v1/dashboard?token=allowed')).status,401);
    const release = 'a'.repeat(64);
    assert.equal((await fetch(url+'/v1/dashboard?release='+release,{headers:{Authorization:'Bearer allowed'}})).status,200);
    assert.equal(selectedRelease, release);
    assert.equal((await fetch(url+'/v1/dashboard?release=../current.json',{headers:{Authorization:'Bearer allowed'}})).status,400);
  } finally {await new Promise(resolve => server.close(resolve));}
});

test('HTML navigation authenticates a bounded POST body and never accepts URL tokens', async () => {
  let reads=0; let received;
  const server=createServer(createHandler({config,verifyToken:async token=>{
    if(token==='allowed')return claims(emails[0]);
    if(token==='other')return claims('outsider@example.com');
    throw new Error('invalid');
  },asset:async(path,res,release)=>{reads++;received={path,release};res.end('private HTML');}}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/v1/embed`,release='b'.repeat(64);
  const headers={Origin:config.origin,'Content-Type':'application/x-www-form-urlencoded'};
  const post=(body,h=headers)=>fetch(url,{method:'POST',headers:h,body});
  try{
    for(const [token,status] of [['allowed',200],['other',403],['invalid',401],['',401]]){
      const r=await post(new URLSearchParams({id_token:token,release}));
      assert.equal(r.status,status);assert.match(r.headers.get('Cache-Control'),/no-store/);
      if(status!==200)assert.doesNotMatch(await r.text(),/private HTML/);
    }
    assert.deepEqual(received,{path:'/v1/dashboard',release});assert.equal(reads,1);
    for(const origin of ['', 'null','https://evil.example'])assert.equal((await post(new URLSearchParams({id_token:'allowed',release}),{...headers,Origin:origin})).status,403);
    assert.equal((await post(JSON.stringify({id_token:'allowed',release}),{...headers,'Content-Type':'application/json'})).status,415);
    assert.equal((await post(new URLSearchParams({id_token:'allowed',release:'../current.json'}))).status,400);
    assert.equal((await post(`id_token=allowed&id_token=allowed&release=${release}`)).status,400);
    assert.equal((await post('x'.repeat(32769))).status,413);
    assert.equal((await fetch(url+'?id_token=allowed&release='+release)).status,405);
    assert.equal((await post(new URLSearchParams({release})) ).status,400);
    assert.equal(reads,1);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
