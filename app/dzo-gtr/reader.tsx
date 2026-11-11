'use client';

import {useEffect, useRef, useState} from 'react';
import {initializeApp, getApps} from '@firebase/app';
import {getAuth, GoogleAuthProvider, inMemoryPersistence, setPersistence, signInWithPopup, signOut, type User} from '@firebase/auth';
import config from './public-config.json';
import styles from './reader.module.css';

export default function FinanceReader() {
  const [user, setUser] = useState<User | null>(null);
  const [embed, setEmbed] = useState<{token: string; release: string} | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [asOf, setAsOf] = useState('');
  const [release, setRelease] = useState('');
  const request = useRef<AbortController | null>(null);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const expiry = useRef<ReturnType<typeof setTimeout> | null>(null);

  function auth() {
    return getAuth(getApps().find(a => a.name === 'finance-reader') ?? initializeApp(config.firebase, 'finance-reader'));
  }
  function clear() {
    request.current?.abort();
    if (expiry.current) clearTimeout(expiry.current);
    if (frame.current) frame.current.src = 'about:blank';
    setEmbed(null); setUser(null); setAsOf(''); setRelease('');
  }
  async function logout() {clear(); setError(''); await signOut(auth());}
  async function get(path: string, account: User, signal?: AbortSignal) {
    const token = await account.getIdToken();
    const response = await fetch(config.apiOrigin + path, {
      headers: {Authorization: 'Bearer ' + token}, cache: 'no-store', credentials: 'omit', signal,
    });
    if (response.status === 403) throw new Error('Для этого аккаунта доступ закрыт. Войдите другим Google-аккаунтом.');
    if (response.status === 401) throw new Error('Войдите в Google заново.');
    if (!response.ok) throw new Error('Не удалось загрузить отчёт. Попробуйте ещё раз.');
    return response;
  }
  async function login() {
    setBusy(true); setError(''); clear();
    const controller = new AbortController(); request.current = controller;
    try {
      await setPersistence(auth(), inMemoryPersistence);
      const provider = new GoogleAuthProvider(); provider.setCustomParameters({prompt: 'select_account'});
      const result = await signInWithPopup(auth(), provider);
      const manifest = await (await get('/v1/manifest', result.user, controller.signal)).json();
      if (!/^[a-f0-9]{64}$/.test(manifest.release)) throw new Error('Не удалось проверить версию отчёта.');
      const token = await result.user.getIdToken();
      if (controller.signal.aborted) return;
      setAsOf(manifest.asOf); setRelease(manifest.release); setUser(result.user);
      setEmbed({token, release: manifest.release});
      expiry.current = setTimeout(() => {void logout();}, 55 * 60 * 1000);
    } catch (e) {
      const aborted = controller.signal.aborted;
      clear(); await signOut(auth());
      if (!aborted) setError(e instanceof Error ? e.message : 'Не удалось войти.');
    } finally {setBusy(false);}
  }
  async function pdf() {
    const signal = request.current?.signal;
    if (!user || !release || !signal || signal.aborted) return;
    try {
      const blob = await (await get('/v1/report.pdf?release=' + release, user, signal)).blob();
      if (signal.aborted) return;
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'DZO_GTR_daily.pdf'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
    } catch(e) {if (!signal.aborted) setError(e instanceof Error ? e.message : 'Не удалось скачать PDF.');}
  }
  useEffect(() => {
    if (!embed || !frame.current) return;
    // A real document URL is required by the dashboard's history/navigation API.
    // POST keeps the short-lived Google token out of URLs and server access logs.
    const form = document.createElement('form');
    form.method = 'POST'; form.action = config.apiOrigin + '/v1/embed';
    form.target = 'finance-report-frame'; form.hidden = true;
    for (const [name, value] of Object.entries({id_token: embed.token, release: embed.release})) {
      const input = document.createElement('input'); input.type = 'hidden';
      input.name = name; input.value = value; form.append(input);
    }
    document.body.append(form);
    try { form.submit(); } finally { form.remove(); }
  }, [embed]);
  useEffect(() => () => {
    request.current?.abort();
    if (expiry.current) clearTimeout(expiry.current);
    if (frame.current) frame.current.src = 'about:blank';
  }, []);

  return <main className={styles.page}>
    <header className={styles.header}>
      <a className={styles.brand} href="/">J3D1.FM</a><span className={styles.title}>DZO / GTR</span>
      {user && <><span className={styles.account}>{user.email}</span><button onClick={pdf}>Скачать PDF</button><button onClick={logout}>Выйти</button></>}
    </header>
    {!embed ? <section className={styles.login}>
      <p className={styles.eyebrow}>DZO / GTR</p><h1>Финансовый дашборд</h1>
      <p>Войдите в Google, чтобы открыть отчёт.</p>
      <button className={styles.primary} disabled={busy} onClick={login}>{busy ? 'Входим и загружаем отчёт…' : 'Войти через Google'}</button>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section> : <>
      <div className={styles.status}>Данные по {asOf}{error && <span role="alert"> · {error}</span>}</div>
      <iframe ref={frame} name="finance-report-frame" className={styles.dashboard} title="Финансовый дашборд DZO / GTR" sandbox="allow-scripts allow-same-origin allow-downloads" referrerPolicy="strict-origin" />
    </>}
  </main>;
}
