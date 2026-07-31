const principles = [
  {
    number: "01",
    title: "See clearly",
    text: "Find the real constraint before adding another layer of complexity.",
  },
  {
    number: "02",
    title: "Make decisively",
    text: "Turn ambiguity into one sharp move that changes the product.",
  },
  {
    number: "03",
    title: "Ship honestly",
    text: "Build proof that survives contact with users, markets and reality.",
  },
];

export default function Home() {
  return (
    <main>
      <div className="ambient" aria-hidden="true" />

      <header className="site-header frame">
        <a className="wordmark" href="#top" aria-label="J3D1.FM home">
          J3D1<span>.FM</span>
        </a>
        <div className="on-air" aria-label="Transmission is live">
          <span className="pulse" aria-hidden="true" />
          Live signal
        </div>
      </header>

      <section className="hero frame" id="top">
        <div className="hero-meta mono">
          <span>Transmission 001</span>
          <span>Independent frequency</span>
        </div>

        <h1>
          Signal
          <span>over noise</span>
        </h1>

        <div className="hero-bottom">
          <p className="hero-copy">
            Products, games and AI systems — shaped from first principles and
            shipped with intent.
          </p>
          <a className="signal-link" href="#frequency">
            Enter the signal <span aria-hidden="true">↘</span>
          </a>
        </div>
      </section>

      <div className="wave-stage" aria-hidden="true">
        <div className="frequency-line" />
        <div className="wave wave-a" />
        <div className="wave wave-b" />
        <div className="wave wave-c" />
        <div className="wave wave-d" />
        <span className="frequency-label mono">88.1 — 108.0 MHz</span>
      </div>

      <section className="frequency frame" id="frequency">
        <div className="section-kicker mono">
          <span>Operating system</span>
          <span>03 principles</span>
        </div>

        <div className="principles">
          {principles.map((principle) => (
            <article className="principle" key={principle.number}>
              <span className="principle-number mono">{principle.number}</span>
              <h2>{principle.title}</h2>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="manifesto frame">
        <p className="mono">The work</p>
        <h2>
          Where product strategy, creative direction and execution collide.
          <span> Less theatre. More proof.</span>
        </h2>
      </section>

      <footer className="site-footer frame">
        <div>
          <p className="wordmark footer-mark">
            J3D1<span>.FM</span>
          </p>
          <p className="footer-note mono">Stay on frequency.</p>
        </div>
        <nav aria-label="External links">
          <a href="https://github.com/J3d1-fm" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a
            href="https://www.linkedin.com/in/fmj3d1/"
            rel="noreferrer"
          >
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <p className="copyright mono">© 2026 / All signal reserved</p>
      </footer>
    </main>
  );
}
