'use client';

import {useEffect, useRef, useState} from 'react';
import {initializeApp, getApps} from '@firebase/app';
import {getAuth, initializeAuth, GoogleAuthProvider, browserLocalPersistence, browserPopupRedirectResolver, onIdTokenChanged, signInWithPopup, signOut, type User} from '@firebase/auth';
import {sessionRemainingMs} from '../../services/finance-reader/session.mjs';
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
  const loadedUid = useRef<string | null>(null);
  const authTime = useRef<number | null>(null);

  function auth() {
    const existing = getApps().find(a => a.name === 'finance-reader');
    return existing ? getAuth(existing) : initializeAuth(initializeApp(config.firebase, 'finance-reader'), {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  }
  function clear() {
    request.current?.abort();
    request.current = null;
    if (expiry.current) clearTimeout(expiry.current);
    expiry.current = null; loadedUid.current = null; authTime.current = null;
    if (frame.current) frame.current.src = 'about:blank';
    setEmbed(null); setUser(null); setAsOf(''); setRelease(''); setBusy(false);
  }
  async function logout() {clear(); setError(''); await signOut(auth());}
  function checkSession() {
    if (expiry.current) clearTimeout(expiry.current);
    if (authTime.current == null) return;
    const remaining = sessionRemainingMs(authTime.current);
    if (!remaining) {
      void logout().then(() => setError('Срок входа истёк. Войдите в Google ещё раз.'));
      return;
    }
    // Daily checks also avoid the browser's 2^31-ms timeout overflow.
    expiry.current = setTimeout(checkSession, Math.min(remaining, 24 * 60 * 60 * 1000));
  }
  function denied(message: string) {return Object.assign(new Error(message), {denied: true});}
  async function get(path: string, account: User, signal?: AbortSignal) {
    const token = await account.getIdToken();
    const response = await fetch(config.apiOrigin + path, {
      headers: {Authorization: 'Bearer ' + token}, cache: 'no-store', credentials: 'omit', signal,
    });
    if (response.status === 403) throw denied('Для этого аккаунта доступ закрыт. Войдите другим Google-аккаунтом.');
    if (response.status === 401) throw denied('Войдите в Google заново.');
    if (!response.ok) throw new Error('Не удалось загрузить отчёт. Попробуйте ещё раз.');
    return response;
  }
  async function restore(account: User | null) {
    if (!account) {clear(); return;}
    if (loadedUid.current === account.uid) {checkSession(); return;}
    clear(); setBusy(true); setError('');
    const controller = new AbortController(); request.current = controller;
    try {
      const tokenResult = await account.getIdTokenResult();
      if (controller.signal.aborted) return;
      const signedAuthTime = Date.parse(tokenResult.authTime) / 1000;
      if (!sessionRemainingMs(signedAuthTime)) throw denied('Срок входа истёк. Войдите в Google ещё раз.');
      const manifest = await (await get('/v1/manifest', account, controller.signal)).json();
      if (!/^[a-f0-9]{64}$/.test(manifest.release)) throw new Error('Не удалось проверить версию отчёта.');
      const token = await account.getIdToken();
      if (controller.signal.aborted) return;
      authTime.current = signedAuthTime; loadedUid.current = account.uid;
      setAsOf(manifest.asOf); setRelease(manifest.release); setUser(account);
      setEmbed({token, release: manifest.release});
      checkSession();
    } catch (e) {
      if (controller.signal.aborted) return;
      clear();
      if (e instanceof Error && 'denied' in e) await signOut(auth());
      setError(e instanceof Error ? e.message : 'Не удалось войти.');
    } finally {if (request.current === controller) setBusy(false);}
  }
  async function login() {
    setBusy(true); setError('');
    try {
      if (auth().currentUser) {await restore(auth().currentUser); return;}
      const provider = new GoogleAuthProvider(); provider.setCustomParameters({prompt: 'select_account'});
      await signInWithPopup(auth(), provider);
      // onIdTokenChanged performs the same verified restore after login and reload.
    } catch (e) {
      setBusy(false); setError(e instanceof Error ? e.message : 'Не удалось войти.');
    }
  }
  async function pdf() {
    const signal = request.current?.signal;
    if (!user || !release || !signal || signal.aborted) return;
    try {
      const blob = await (await get('/v1/report.pdf?release=' + release, user, signal)).blob();
      if (signal.aborted) return;
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'DZO_GTR_daily.pdf'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
    } catch(e) {
      if (signal.aborted) return;
      if (e instanceof Error && 'denied' in e) await logout();
      setError(e instanceof Error ? e.message : 'Не удалось скачать PDF.');
    }
  }
  useEffect(() => {
    let disposed = false; let unsubscribe = () => {};
    setBusy(true);
    try {
      unsubscribe = onIdTokenChanged(auth(), account => {if (!disposed) void restore(account);});
    } catch {
      setBusy(false); setError('Не удалось восстановить вход. Попробуйте войти ещё раз.');
    }
    const visible = () => {if (document.visibilityState === 'visible') checkSession();};
    document.addEventListener('visibilitychange', visible);
    return () => {
      disposed = true; unsubscribe(); document.removeEventListener('visibilitychange', visible);
      request.current?.abort();
      if (expiry.current) clearTimeout(expiry.current);
      if (frame.current) frame.current.src = 'about:blank';
    };
  }, []);
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
  return <main className={styles.page}>
    <header className={styles.header}>
      <a className={styles.brand} href="/">J3D1.FM</a><span className={styles.title}>DZO / GTR</span>
      {user && <><span className={styles.account}>{user.email}</span><button onClick={pdf}>Скачать PDF</button><button onClick={logout}>Выйти</button></>}
    </header>
    {!embed ? <section className={styles.login}>
      <p className={styles.eyebrow}>DZO / GTR</p><h1>Финансовый дашборд</h1>
      <p>Войдите в Google, чтобы открыть отчёт. Вход сохранится на этом устройстве на 30 дней.</p>
      <button className={styles.primary} disabled={busy} onClick={login}>{busy ? 'Входим и загружаем отчёт…' : 'Войти через Google'}</button>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section> : <>
      <div className={styles.status}>Данные по {asOf}{error && <span role="alert"> · {error}</span>}</div>
      <iframe ref={frame} name="finance-report-frame" className={styles.dashboard} title="Финансовый дашборд DZO / GTR" sandbox="allow-scripts allow-same-origin allow-downloads" referrerPolicy="strict-origin" />
    </>}
  </main>;
}
