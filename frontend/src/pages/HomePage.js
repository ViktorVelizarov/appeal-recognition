import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';
import scanPhotoImg from '../assets/scan-photo.png';

const STEPS = [
  {
    name: 'Detect',
    desc: 'A vision model finds every garment and accessory in the photo and scores its confidence.',
  },
  {
    name: 'Match',
    desc: 'Each crop is searched across online catalogues for the same piece, then close alternatives.',
  },
  { name: 'Buy', desc: 'Shop, price and a direct link for every match, closest first.' },
];

// Detect / Match / Buy as one photo the reader never loses, with only the copy
// paging past it. .flow (the outer section) is a tall scroll track; .flow-stage
// pins itself via CSS (position: sticky) while this effect just reads scroll
// position each frame and drives the text track's transform and the progress
// rule directly via refs, skipping React re-renders on every scroll tick.
const Method = () => {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const barRefs = useRef([]);
  const labelRefs = useRef([]);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;

      const rect = wrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

      // Detect holds fully in view for the first 15% of scroll before the slide starts moving,
      // and Buy settles at 90% instead of 100%, so it also holds before the section releases into Pricing.
      const eased = Math.min(1, Math.max(0, (progress - 0.15) / (0.9 - 0.15)));

      track.style.transform = `translateX(-${(eased * 100 * (STEPS.length - 1)) / STEPS.length}%)`;

      // Delay the label handoff so it doesn't flip to the next step the moment the slide starts moving.
      const active = Math.min(STEPS.length - 1, Math.floor(Math.max(0, eased - 0.1) * STEPS.length));
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const local = Math.min(1, Math.max(0, eased * STEPS.length - i));
        bar.style.setProperty('--p', local);
      });
      labelRefs.current.forEach((label, i) => {
        if (label) label.classList.toggle('is-active', i === active);
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section className="flow" id="method" aria-labelledby="mh" ref={wrapRef}>
      <h2 id="mh" className="sr">
        How StyleStealer works
      </h2>
      <div className="flow-stage">
        <div className="flow-left">
          <div className="flow-progress" aria-hidden="true">
            {STEPS.map((s, i) => (
              <i key={s.name} ref={(el) => (barRefs.current[i] = el)} />
            ))}
          </div>
          <div className="flow-labels" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s.name} ref={(el) => (labelRefs.current[i] = el)} className={i === 0 ? 'is-active' : undefined}>
                0{i + 1} {s.name.toLowerCase()}
              </span>
            ))}
          </div>
          <div className="flow-textport">
            <div className="flow-track" ref={trackRef}>
              {STEPS.map((s) => (
                <div className="flow-panel" key={s.name}>
                  <h3 className="step-word flow-word">
                    {s.name}
                    <b>.</b>
                  </h3>
                  <p className="lede">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <figure className="flow-photo">
          <img
            src={scanPhotoImg}
            width="535"
            height="666"
            decoding="async"
            alt="A photographed outfit with orange bounding boxes and confidence scores marking the jacket, pants and shoes"
          />
        </figure>
      </div>
    </section>
  );
};

// The hero's Pricing link jumps over the .flow scrollytelling section, whose sticky
// pin makes the global smooth-scroll race through the slide's transform mid-animation.
// Scrolling instantly instead skips straight past it with nothing to animate.
const jumpToPricing = (e) => {
  e.preventDefault();
  const target = document.getElementById('pricing');
  if (!target) return;
  const root = document.documentElement;
  const prevBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  target.scrollIntoView({ block: 'start' });
  root.style.scrollBehavior = prevBehavior;
};

const HomePage = () => (
  <>
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {Array.from({ length: 4 }).map((_, i) => (
          <React.Fragment key={i}>
            <span>Try a demo</span>
            <i>&bull;</i>
            <span>3 free scans</span>
            <i>&bull;</i>
            <span>Find the same clothes</span>
            <i>&bull;</i>
            <span>See where to buy</span>
            <i>&bull;</i>
          </React.Fragment>
        ))}
      </div>
    </div>

    <header className="bar">
      <Link className="logo" to="/" aria-label="StyleStealer home">
        <span>
          Style
          <br />
          Stealer
        </span>
      </Link>
      <Link className="cell cell--auth" to="/login">
        Sign in
      </Link>
      <Link className="cell cell--cta" to="/register">
        Try a demo
      </Link>
    </header>

    <main id="top">
      <section className="hero" aria-labelledby="h1">
        <figure className="hero-slot">
          <img className="slot-img" src={heroImg} alt="" width="1440" height="1920" fetchPriority="high" />
          <span className="reg tl" aria-hidden="true"></span>
          <span className="reg br" aria-hidden="true"></span>
          <div className="rule-v" aria-hidden="true"></div>
        </figure>

        <div className="hero-copy">
          <h1 id="h1" className="mega">
            Steal
            <br />
            the
            <br />
            look
            <b>.</b>
          </h1>
          <p className="lede">
            Upload any outfit photo. AI vision finds every garment, matches the same or similar clothes, and tells
            you where to buy them online.
          </p>
          <div className="hero-cta-row">
            <Link className="btn" to="/register">
              Try a demo <span aria-hidden="true">&#8599;</span>
            </Link>
            <a className="btn btn--ghost" href="#pricing" onClick={jumpToPricing}>
              Pricing
            </a>
          </div>
          <p className="mono">3 FREE SCANS &nbsp;/&nbsp; THEN CHOOSE A PLAN</p>
        </div>
      </section>

      <div className="dither" aria-hidden="true"></div>

      <Method />

      <section className="pricing" id="pricing" aria-labelledby="prh">
        <h2 id="prh" className="mega mega--m">
          Pricing
          <b>.</b>
        </h2>
        <div className="plan">
          <input type="radio" name="billing" id="bill-m" className="toggle-input" defaultChecked />
          <input type="radio" name="billing" id="bill-y" className="toggle-input" />
          <div className="toggle">
            <label htmlFor="bill-m" className="toggle-opt">
              Monthly
            </label>
            <label htmlFor="bill-y" className="toggle-opt">
              Annual <span className="save mono">SAVE 20%</span>
            </label>
          </div>
          <div className="plan-card">
            <p className="plan-name mono">STYLESTEALER PLAN</p>
            <p className="plan-price">
              <span className="amt amt-m">
                $19<i>/mo</i>
              </span>
              <span className="amt amt-y">
                $182<i>/yr</i>
              </span>
            </p>
            <p className="plan-sub mono">$15.17/mo, billed annually</p>
            <ul className="plan-list">
              <li>
                <span className="mono">01</span>Unlimited photo scans
              </li>
              <li>
                <span className="mono">02</span>Same-item and similar-item matches
              </li>
              <li>
                <span className="mono">03</span>Direct buy links, every result
              </li>
              <li>
                <span className="mono">04</span>Scan history saved to your account
              </li>
            </ul>
            <Link className="btn plan-cta" to="/register">
              Try a demo <span aria-hidden="true">&#8599;</span>
            </Link>
            <p className="mono plan-fine">3 FREE SCANS INCLUDED &nbsp;/&nbsp; CANCEL ANYTIME</p>
          </div>
        </div>
      </section>
    </main>

    <footer className="foot">
      <div className="foot-top">
        <p className="mono">
          STYLESTEALER &copy; 2026 &nbsp;/&nbsp; <a className="foot-link" href="#pricing">Pricing</a>
        </p>
      </div>
    </footer>
  </>
);

export default HomePage;
