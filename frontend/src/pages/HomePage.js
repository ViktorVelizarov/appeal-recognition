import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';

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
      <a className="cell" href="#method">
        Method
      </a>
      <a className="cell" href="#pricing">
        Pricing
      </a>
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
          <figcaption className="fig" aria-hidden="true">
            FIG.01 &nbsp;/&nbsp; DITHER BAYER 8&times;8 &nbsp;/&nbsp; X 0812 Y 0447
          </figcaption>
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
          <Link className="btn" to="/register">
            Try a demo <span aria-hidden="true">&#8599;</span>
          </Link>
          <p className="mono">3 FREE SCANS &nbsp;/&nbsp; THEN CHOOSE A PLAN</p>
        </div>

        <div className="word" aria-hidden="true">
          StyleStealer
        </div>
      </section>

      <div className="dither" aria-hidden="true"></div>

      <section className="method" id="method" aria-labelledby="mh">
        <h2 id="mh" className="sr">
          How StyleStealer works
        </h2>
        <article className="slab slab--k">
          <p className="word-l">Detect</p>
          <div className="slab-c">
            <p className="slab-t">
              A vision model finds every garment and accessory in the photo and scores its confidence.
            </p>
            <svg className="glyph" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M20 70V20h50M170 20h50v50M220 170v50h-50M70 220H20v-50" />
                <path d="M96 120h48M120 96v48" opacity=".7" />
              </g>
              <text x="34" y="40" fill="currentColor" fontFamily="Space Mono, monospace" fontSize="11">
                D-01 0.96
              </text>
            </svg>
          </div>
          <p className="slab-m mono">01 / 03 &nbsp; T+0.3S &nbsp; X 0812 Y 0447</p>
        </article>
        <article className="slab slab--b">
          <p className="word-l">Match</p>
          <div className="slab-c">
            <p className="slab-t">
              Each crop is searched across online catalogues for the same piece, then close alternatives.
            </p>
            <svg className="glyph" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <rect x="20" y="70" width="80" height="100" />
                <rect x="140" y="70" width="80" height="100" />
                <path d="M104 120h32" strokeDasharray="4 5" />
              </g>
              <text x="24" y="62" fill="currentColor" fontFamily="Space Mono, monospace" fontSize="11">
                SRC
              </text>
              <text x="144" y="62" fill="currentColor" fontFamily="Space Mono, monospace" fontSize="11">
                SAME / SIMILAR
              </text>
            </svg>
          </div>
          <p className="slab-m mono">02 / 03 &nbsp; T+0.6S &nbsp; N 3 MATCHES / ITEM</p>
        </article>
        <article className="slab slab--o">
          <p className="word-l">Buy</p>
          <div className="slab-c">
            <p className="slab-t">Shop, price and a direct link for every match, closest first.</p>
            <svg className="glyph" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M30 40h110l70 80-70 80H30z" />
                <circle cx="62" cy="120" r="10" />
                <path d="M110 150l52-52M126 98h36v36" />
              </g>
            </svg>
          </div>
          <p className="slab-m mono">03 / 03 &nbsp; T+0.9S &nbsp; LINK OUT</p>
        </article>
      </section>

      <section className="pricing" id="pricing" aria-labelledby="prh">
        <h2 id="prh" className="mega mega--m">
          Pricing
          <b>.</b>
        </h2>
        <p className="pricing-sub">Three scans free when you sign up. After that, one plan &mdash; pick how you pay.</p>
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
        <Link className="btn" to="/register">
          Try a demo <span aria-hidden="true">&#8599;</span>
        </Link>
      </div>
      <div className="word word--foot" aria-hidden="true">
        StyleStealer
      </div>
    </footer>
  </>
);

export default HomePage;
