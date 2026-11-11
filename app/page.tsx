const dial = ["88", "92", "96", "100", "104", "108"];

export default function Home() {
  return (
    <main className="home">
      <div className="ambient" aria-hidden="true" />

      <header className="site-header frame">
        <a className="wordmark" href="#top" aria-label="J3D1.FM home">
          J3D1<span>.FM</span>
        </a>
        <div className="on-air mono" aria-label="Transmission is live">
          <span className="pulse" aria-hidden="true" />
          Live signal
        </div>
      </header>

      <section className="hero frame" id="top">
        <div className="hero-meta mono">
          <span>Transmission 004</span>
          <span>Independent frequency</span>
        </div>

        <h1>
          Signal
          <span>over noise</span>
        </h1>
      </section>

      <div className="tuner" aria-hidden="true">
        <div className="tuner-ruler" />
        <div className="tuner-scan" />
        <div className="tuner-needle">
          <span className="mono">101.3 · on air</span>
        </div>
        <div className="tuner-labels mono">
          {dial.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </div>

      <footer className="site-footer frame">
        <div>
          <p className="wordmark footer-mark">
            J3D1<span>.FM</span>
          </p>
          <p className="footer-note mono">Stay on frequency.</p>
        </div>
        <nav aria-label="External links">
          <a href="https://t.me/j3d1_fm" rel="noreferrer">
            Telegram <span aria-hidden="true">↗</span>
          </a>
          <a href="https://www.linkedin.com/in/fmj3d1/" rel="noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <p className="copyright mono">© 2026 / All signal reserved</p>
      </footer>
    </main>
  );
}
