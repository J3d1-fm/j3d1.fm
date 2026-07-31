type Tone = "live" | "beta" | "rack";

type Card = {
  name: string;
  status: string;
  tone: Tone;
  text: string;
  meta: string;
  href?: string;
  cta?: string;
};

type Wave = {
  name: string;
  text: string;
  tag: string;
  href?: string;
};

const stats: Array<[string, string]> = [
  ["03", "apps in stores & betas"],
  ["04", "self-built backends"],
  ["11", "languages shipped"],
  ["01", "human, plus agents"],
];

const onAir: Card[] = [
  {
    name: "Learn Piano: Play Songs",
    status: "Live · App Store",
    tone: "live",
    text: "Point the camera at sheet music, or let it listen to a song — either becomes a playable lesson. Score recognition and note transcription run on the phone, and the mic hears your real piano while you practice.",
    meta: "iOS · Android open beta · CoreML",
    href: "https://apps.apple.com/app/learn-piano-play-songs/id6784630194",
    cta: "App Store",
  },
  {
    name: "MenuSage",
    status: "TestFlight beta",
    tone: "beta",
    text: "One photo of a restaurant menu — or of the plate itself — and it says what to order for your health profile: allergens, macros and nutrition numbers it does not make up.",
    meta: "iOS · SwiftUI · Gemini",
  },
  {
    name: "Crush Check",
    status: "Beta · both stores",
    tone: "beta",
    text: "A joke red-flag detector: feed it a photo or a chat screenshot, get a verdict. Analysis stays on the device, and a serious safety mode takes over when it stops being funny.",
    meta: "iOS · Android · on-device ML",
  },
  {
    name: "GetDesign",
    status: "Working v1",
    tone: "beta",
    text: "A B2B marketplace where brands license fashion designs: watermarked previews out in the open, full tech packs released from escrow once the deal closes.",
    meta: "Web · Next.js · Firestore",
  },
];

const rack: Card[] = [
  {
    name: "UniversalMMP",
    status: "In production",
    tone: "live",
    text: "Mobile attribution without AppsFlyer: install matching, a production Swift SDK and live ad-spend connectors. The apps above report into it every day.",
    meta: "Python · Cloud Run · Postgres",
  },
  {
    name: "PurchaseKit",
    status: "Deployed",
    tone: "rack",
    text: "Subscriptions and one-time purchases without RevenueCat: StoreKit 2 receipts verified without Apple keys, Google Play notifications ingested, entitlements served over signed webhooks.",
    meta: "FastAPI · Cloud Run · Firestore",
  },
  {
    name: "Marketworthy",
    status: "Internal autopilot",
    tone: "rack",
    text: "A marketing autopilot with a taste gate: it watches competitors over the public iTunes API, drafts campaigns from evidence, and publishes nothing until a human signs off.",
    meta: "Node · Firebase · iTunes Lookup API",
  },
  {
    name: "Knowledge Vault",
    status: "Always on",
    tone: "rack",
    text: "An agent-owned wiki that compiles every working session into entity cards, sources and health checks. The copy on this page came out of it — not out of thin air.",
    meta: "Markdown · Obsidian · Firestore",
  },
];

const shortWaves: Wave[] = [
  {
    name: "Playable Forge",
    text: "Constructor for HTML5 playable ads with a fake-3D garage scene; export presets for AppLovin, Google, Meta and Mintegral.",
    tag: "Internal tool",
  },
  {
    name: "Night Run",
    text: "Top-down traffic-dodge playable ad with photoreal car sprites.",
    tag: "Playable",
  },
  {
    name: "Personal Task Assistant",
    text: "Human/AI task queue with an atomic claim API and a Telegram adapter.",
    tag: "GitHub",
    href: "https://github.com/J3d1-fm/Personal-Task-Assistant",
  },
  {
    name: "MMPredictions",
    text: "Open-source constructor for pROAS and pLTV prediction dashboards over MMP cohort data.",
    tag: "GitHub",
    href: "https://github.com/J3d1-fm/MMPredictions",
  },
  {
    name: "Genhood",
    text: "genhood.com rebuilt from Wix into a fast static site with a bold Gen-Z direction.",
    tag: "genhood.com",
    href: "https://genhood.com",
  },
  {
    name: "Eponymical Games",
    text: "The studio shell the store releases ship under.",
    tag: "eponymicalgames.com",
    href: "https://eponymicalgames.com",
  },
];

const dial = ["88", "92", "96", "100", "104", "108"];

function StatusChip({ status, tone }: { status: string; tone: Tone }) {
  return (
    <span className={`chip chip-${tone} mono`}>
      <span className="chip-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

function ProjectCard({ card }: { card: Card }) {
  return (
    <article className="card rise">
      <div className="card-top">
        <StatusChip status={card.status} tone={card.tone} />
        {card.href ? (
          <a className="card-cta mono" href={card.href} rel="noreferrer">
            {card.cta ?? "Open"} <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
      <h3>{card.name}</h3>
      <p>{card.text}</p>
      <p className="card-meta mono">{card.meta}</p>
    </article>
  );
}

export default function Home() {
  return (
    <main>
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
          <span>Transmission 002</span>
          <span>Independent frequency</span>
        </div>

        <h1>
          Signal
          <span>over noise</span>
        </h1>

        <div className="hero-bottom">
          <p className="hero-copy">
            A one-person product studio with its own gear: a piano teacher live
            on the App Store, an AI menu reader in TestFlight, a joke red-flag
            detector — and home-built attribution, subscriptions and a marketing
            autopilot wired in behind them.
          </p>
          <a className="signal-link mono" href="#on-air">
            Tune in <span aria-hidden="true">↘</span>
          </a>
        </div>

        <dl className="stats">
          {stats.map(([value, label]) => (
            <div className="stat rise" key={label}>
              <dt className="mono">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
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

      <section className="band frame" id="on-air">
        <div className="section-kicker mono">
          <span>Freq 01 · On air</span>
          <span>Shipping now — 04 products</span>
        </div>
        <div className="card-grid">
          {onAir.map((card) => (
            <ProjectCard card={card} key={card.name} />
          ))}
        </div>
      </section>

      <section className="band frame" id="rack">
        <div className="section-kicker mono">
          <span>Freq 02 · The rack</span>
          <span>Self-built infrastructure — 04 systems</span>
        </div>
        <div className="card-grid">
          {rack.map((card) => (
            <ProjectCard card={card} key={card.name} />
          ))}
        </div>
      </section>

      <section className="band frame" id="short-waves">
        <div className="section-kicker mono">
          <span>Freq 03 · Short waves</span>
          <span>Smaller transmissions — 06</span>
        </div>
        <ul className="waves">
          {shortWaves.map((wave) => (
            <li className="wave-row rise" key={wave.name}>
              <h3>{wave.name}</h3>
              <p>{wave.text}</p>
              {wave.href ? (
                <a className="wave-tag mono" href={wave.href} rel="noreferrer">
                  {wave.tag} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="wave-tag mono is-static">{wave.tag}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="outro frame">
        <p className="mono">Station ID</p>
        <h2>
          Every card on this page is a running system you can install, measure
          or read — not a slide. <span>The noise stays off the air.</span>
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
          <a
            href="https://apps.apple.com/app/learn-piano-play-songs/id6784630194"
            rel="noreferrer"
          >
            App Store <span aria-hidden="true">↗</span>
          </a>
          <a href="https://github.com/J3d1-fm" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href="https://www.linkedin.com/in/fmj3d1/" rel="noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a href="https://eponymicalgames.com" rel="noreferrer">
            Studio <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <p className="copyright mono">© 2026 / All signal reserved</p>
      </footer>
    </main>
  );
}
