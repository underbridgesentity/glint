const APP = '#'; // customer app download / deep link (wire to store URLs at launch)

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CDFF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

function Logo({ size = 18 }: { size?: number }) {
  return (
    <span className="g-logo"><span className="mark" /><span className="name" style={{ fontSize: size }}>Glint</span></span>
  );
}

export default function Marketing() {
  return (
    <>
      {/* NAV */}
      <nav className="bar">
        <div className="bar-inner">
          <Logo />
          <div className="bar-links">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#estates">For estates</a>
          </div>
          <a className="g-btn g-btn--lemon g-btn--sm" href={APP}>Get the app</a>
        </div>
      </nav>

      <div className="wrap">
        {/* HERO */}
        <header className="hero">
          <div className="hero-eyebrow"><span className="g-label">Responsible car care · Sandton &amp; Midrand</span></div>
          <h1 className="g-display">Drop it. Clean.<br /><em>Collected by you.</em></h1>
          <p className="hero-sub">Drop your car at the Glint bay in your building, get back to your day, and collect it spotless — released only to you, by code, with photo proof.</p>
          <div className="hero-cta">
            <a className="g-btn g-btn--lemon" href={APP}>Book your first wash</a>
            <a className="g-btn g-btn--ghost" href="#how">See how it works</a>
          </div>

          <div className="hero-visual">
            <div className="hv-spot" />
            <div className="hv-dot" />
            <div className="hv-label">
              <span>Anchor image — to be shot</span>
              <p>Dark underground parking bay. A single black sedan, glass-clean under a precise overhead light. High-gloss reflection on polished concrete. No people.</p>
            </div>
          </div>
        </header>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat"><div className="n"><em>0</em></div><div className="l">Runoff into storm drains. Biodegradable products.</div></div>
        <div className="stat"><div className="n">2-step</div><div className="l">Code-verified drop-off &amp; collection.</div></div>
        <div className="stat"><div className="n">9–3</div><div className="l">Washed during your workday.</div></div>
        <div className="stat"><div className="n">4.9<em>★</em></div><div className="l">Average wash rating across sites.</div></div>
      </div>

      <div className="wrap">
        {/* HOW IT WORKS */}
        <section className="blk" id="how">
          <div className="blk-head">
            <span className="g-label">How it works</span>
            <h2 className="g-h2" style={{ marginTop: 20 }}>Drop off. Get on with your day.</h2>
            <p>A Glint bay sits right in your estate or office park. Two simple, code-verified steps — your car is never released to the wrong hands.</p>
          </div>

          <div className="paths">
            <div className="path">
              <div className="path-top"><h3 className="g-h3">The drop-off</h3><span className="g-pill g-pill--neutral">Step 1</span></div>
              {[['1', 'Book a slot', 'Pick a time in the app. Takes under a minute.'],
                ['2', 'Drive to the Glint bay', "It's right in your building's parking — a minute away."],
                ['3', 'Check in by code', 'Show your drop-off code. We log a quick before-photo inspection.'],
                ['4', 'Get on with your day', "Leave the car with us. We'll take it from here."]].map(([n, h, p]) => (
                <div className="step" key={n}><span className="sn">{n}</span><div><h4>{h}</h4><p className="g-body">{p}</p></div></div>
              ))}
            </div>
            <div className="path">
              <div className="path-top"><h3 className="g-h3">The collection</h3><span className="g-pill g-pill--lemon">Step 2</span></div>
              {[['1', '“It’s ready”', 'We notify you the moment your car is done.'],
                ['2', 'Show your collection code', 'Your car is released only to whoever holds the code.'],
                ['3', 'Drive away clean', 'Proof photos and an after-inspection are attached.'],
                ['4', 'Rate the wash', 'Anything below three triggers a free re-wash, automatically.']].map(([n, h, p]) => (
                <div className="step" key={n}><span className="sn">{n}</span><div><h4>{h}</h4><p className="g-body">{p}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="blk" id="pricing">
          <div className="blk-head">
            <span className="g-label">Pricing</span>
            <h2 className="g-h2" style={{ marginTop: 20 }}>Subscribe and forget it.</h2>
            <p>One monthly price. Your car, handled. Cancel or pause anytime — no fees, no calls.</p>
          </div>

          <div className="price-grid">
            <div className="price">
              <div className="pname"><h3 className="g-h3">Basic</h3></div>
              <div className="amt tnum">R450<span>/mo</span></div>
              <p className="g-meta">Exterior wash, once a week.</p>
              <ul>
                {['4 washes per month', 'Same wash day each week', 'Drop-and-go in minutes', 'Pause anytime'].map((t) => (
                  <li key={t}><Check />{t}</li>
                ))}
              </ul>
              <a className="g-btn g-btn--ghost g-btn--block" href={APP}>Choose Basic</a>
            </div>
            <div className="price feat">
              <div className="pname"><h3 className="g-h3">Premium</h3><span className="g-pill g-pill--lemon">Most chosen</span></div>
              <div className="amt tnum">R750<span>/mo</span></div>
              <p className="g-meta">Full interior + exterior, twice a week.</p>
              <ul>
                {['8 washes per month', 'Monthly Premium detail', 'Priority morning slots', 'Free re-wash guarantee'].map((t) => (
                  <li key={t}><Check />{t}</li>
                ))}
              </ul>
              <a className="g-btn g-btn--lemon g-btn--block" href={APP}>Choose Premium</a>
            </div>
          </div>

          <p className="g-meta" style={{ margin: '34px 0 16px' }}>Or pay as you go — no subscription:</p>
          <div className="oneoff">
            {[['Express', 'R99', 'Exterior · 25 min'], ['Full', 'R199', 'Interior + exterior · 45 min'], ['Premium', 'R299', 'Full detail · 75 min']].map(([n, p, d]) => (
              <div className="o" key={n}><div className="on">{n}</div><div className="op tnum">{p}</div><div className="od">{d}</div></div>
            ))}
          </div>
        </section>

        {/* TRUST */}
        <section className="blk">
          <div className="blk-head">
            <span className="g-label">Why it&rsquo;s safe</span>
            <h2 className="g-h2" style={{ marginTop: 20 }}>Trust the handover.</h2>
            <p>You&rsquo;re leaving your car with us. We built the whole operation around earning that — and around making sure only you get it back.</p>
          </div>
          <div className="trust">
            <div className="trust-card">
              <div className="trust-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" /></svg></div>
              <h4 className="g-h3">Released only to you</h4>
              <p className="g-body">Drop-off and collection are each verified by a one-time code and logged with before-and-after photos. Your car is never handed over without the code. Insured end to end.</p>
            </div>
            <div className="trust-card">
              <div className="trust-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14a6 6 0 0 1-1-1Z" /><path d="M5 19c3-3 6-5 9-6" /></svg></div>
              <h4 className="g-h3">Responsible by design</h4>
              <p className="g-body">Controlled water use, captured on site so nothing runs into the storm drains. Biodegradable, low-impact products on every wash — proper clean, lighter footprint.</p>
            </div>
            <div className="trust-card">
              <div className="trust-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.6 5.6L20 9.4l-4 4 1 6-5-2.8L7 19.4l1-6-4-4 5.4-.8L12 3Z" /></svg></div>
              <h4 className="g-h3">Trained, then trusted</h4>
              <p className="g-body">Every washer completes a two-week academy and works a 15-point checklist on your car. Rate every wash — anything below three triggers a free re-wash, automatically.</p>
            </div>
          </div>
        </section>

        {/* B2B */}
        <section className="blk" id="estates">
          <div className="b2b">
            <div>
              <span className="g-label">For property managers</span>
              <h2 className="g-h2" style={{ marginTop: 18 }}>Bring Glint<br />to your building.</h2>
              <p>A Glint station is an embedded micro-business — an amenity your residents and tenants notice, run by a trained team you never have to manage. It fits in under four square metres.</p>
              <a className="g-btn g-btn--lemon" href="#" style={{ marginTop: 28 }}>Talk to our team</a>
            </div>
            <div className="b2b-spec">
              <div className="row"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CDFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg><div><b>1–2 parking bays</b> <span>· for equipment</span></div></div>
              <div className="row"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CDFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg><div><b>1 power outlet</b> <span>· for vacuum charging</span></div></div>
              <div className="row"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CDFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></svg><div><b>No plumbing needed</b> <span>· self-contained water</span></div></div>
              <div className="row"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CDFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /></svg><div><b>Under 4m² total</b> <span>· lockable cage + signage</span></div></div>
            </div>
          </div>
        </section>
      </div>

      {/* DOWNLOAD CTA */}
      <div className="wrap">
        <section className="cta-band">
          <span className="g-label" style={{ display: 'block', marginBottom: 28 }}>Get started</span>
          <h2 className="g-display">No queues.<br /><em>No waiting.</em><br />No excuses.</h2>
          <div className="store-row">
            <a className="store" href={APP}><svg width="22" height="22" viewBox="0 0 24 24" fill="#F8F8F8"><path d="M17.6 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.6 0-1.7-.7-2.7-.7-1.4 0-2.7.8-3.4 2-1.4 2.5-.4 6.2 1 8.2.7 1 1.4 2.1 2.4 2.1.9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6 1 0 1.6-1 2.3-2 .7-1.1 1-2.2 1-2.3-.1 0-1.9-.7-1.9-2.9Z" /><path d="M15.5 6.4c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.3 1.2-.5.6-1 1.5-.8 2.3.9.1 1.8-.4 2.3-1.1Z" /></svg><div style={{ textAlign: 'left' }}><div className="st-sm">Download on the</div><div className="st-lg">App Store</div></div></a>
            <a className="store" href={APP}><svg width="22" height="22" viewBox="0 0 24 24" fill="#CDFF00"><path d="M4 3l11 9-11 9V3Z" /></svg><div style={{ textAlign: 'left' }}><div className="st-sm">Get it on</div><div className="st-lg">Google Play</div></div></a>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="site">
        <div className="wrap">
          <div className="foot-grid">
            <div style={{ maxWidth: 280 }}>
              <Logo />
              <p className="g-body" style={{ fontSize: 14, marginTop: 16 }}>App-led, responsible car care for South African estates and office parks.</p>
            </div>
            <div className="foot-links">
              <div className="foot-col">
                <h5>Product</h5>
                <a href={APP}>Customer app</a>
                <a href="#how">How it works</a>
                <a href="#pricing">Pricing</a>
              </div>
              <div className="foot-col">
                <h5>Business</h5>
                <a href="#estates">For estates</a>
                <a href="#estates">For office parks</a>
              </div>
              <div className="foot-col">
                <h5>Company</h5>
                <a href="#">About</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
                <a href="/privacy">Privacy</a>
              </div>
            </div>
          </div>
          <div className="g-divider" style={{ margin: '40px 0 24px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span className="g-meta">© 2026 Glint. Responsible car care.</span>
            <span className="g-meta">Sandton · Midrand · Fourways</span>
          </div>
        </div>
      </footer>
    </>
  );
}
