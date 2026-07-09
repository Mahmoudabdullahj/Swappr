'use client';

import { useEffect, useState } from 'react';

interface Stats { listings: number; traders: number; }

interface Props {
  onGetStarted?: () => void;
  embedded?: boolean;
  loggedIn?: boolean;
  children?: React.ReactNode;
}

export default function LandingPage({ onGetStarted, embedded, loggedIn, children }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const landing = document.querySelector('.landing');
    const targets = document.querySelectorAll<Element>('.landing-section, .landing-cta-section');
    if (!targets.length) return;

    landing?.classList.add('js-reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className="landing">

      {/* ── Topbar — hidden when embedded inside the app shell ── */}
      {!embedded && (
        <header className="landing-nav">
          <div className="landing-nav-logo">
            <span className="logo-mark">SW</span>
            <span className="logo-wordmark">Swaparr</span>
          </div>
          <button className="landing-signin-btn" onClick={onGetStarted}>Sign in</button>
        </header>
      )}

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-pill">Amman&apos;s barter marketplace</div>
<h1 className="landing-h1">
          <span className="landing-h1-line1">Trade what you have.</span><br />
          Get what you need.
        </h1>
        <p className="landing-sub">
          Swaparr is a local barter marketplace. No money changes hands,
          just fair direct trades between people near you.
        </p>

        {/* CTAs — only shown when not yet logged in */}
        {!loggedIn && (
          <div className="landing-hero-actions">
            <button className="landing-cta-primary" onClick={onGetStarted}>
              Start trading, it&apos;s free
            </button>
            <a className="landing-cta-ghost" href="#how-it-works">
              See how it works ↓
            </a>
          </div>
        )}

        {/* Stats */}
        <div className="landing-stats">
          <div className="landing-stat">
            <span className="landing-stat-value">{stats ? fmt(stats.listings) : '—'}</span>
            <span className="landing-stat-label">Active listings</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-value">{stats ? fmt(stats.traders) : '—'}</span>
            <span className="landing-stat-label">Traders</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-value">12</span>
            <span className="landing-stat-label">Categories</span>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section" id="how-it-works">
        <div className="landing-section-inner">
          <p className="landing-overline">The process</p>
          <h2 className="landing-h2">Three steps to your next trade</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <span className="landing-step-num">01</span>
              <h3 className="landing-step-title">List what you have</h3>
              <p className="landing-step-body">
                Describe your item, set a trade value, and tell us what you&apos;re
                looking for. Takes under two minutes.
              </p>
            </div>
            <div className="landing-step-arrow">→</div>
            <div className="landing-step">
              <span className="landing-step-num">02</span>
              <h3 className="landing-step-title">Get matched</h3>
              <p className="landing-step-body">
                Our algorithm finds people who want what you have and have
                what you want. Both sides win, or we don&apos;t surface the match.
              </p>
            </div>
            <div className="landing-step-arrow">→</div>
            <div className="landing-step">
              <span className="landing-step-num">03</span>
              <h3 className="landing-step-title">Meet &amp; swap</h3>
              <p className="landing-step-body">
                Agree on a time, meet somewhere local, and trade. No
                shipping, no waiting, no fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Injected content (e.g. exact matches + trending) ── */}
      {children}

      {/* ── Why Swaparr ── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <p className="landing-overline">Why Swaparr</p>
          <h2 className="landing-h2">Built different from the start</h2>
          <div className="landing-features">
            <div className="landing-feature">
              <h3 className="landing-feature-title">No cash required</h3>
              <p className="landing-feature-body">
                Everything runs on trade value, not money. You don&apos;t need a
                wallet, just something worth offering.
              </p>
            </div>
            <div className="landing-feature">
              <h3 className="landing-feature-title">Exact-match algorithm</h3>
              <p className="landing-feature-body">
                We only surface listings where both sides genuinely benefit.
                No scrolling through irrelevant offers.
              </p>
            </div>
            <div className="landing-feature">
              <h3 className="landing-feature-title">Amman-local, always</h3>
              <p className="landing-feature-body">
                Every trader is in your city, often your neighbourhood.
                Trades happen face-to-face, not across borders.
              </p>
            </div>
            <div className="landing-feature">
              <h3 className="landing-feature-title">Review-backed profiles</h3>
              <p className="landing-feature-body">
                Every trader has a public rating built from completed trades.
                Trust is earned, not assumed.
              </p>
            </div>
            <div className="landing-feature">
              <h3 className="landing-feature-title">Zero fees, ever</h3>
              <p className="landing-feature-body">
                We don&apos;t take a cut of your trade. Swaparr is free to use,
                today and permanently.
              </p>
            </div>
            <div className="landing-feature">
              <h3 className="landing-feature-title">Any category</h3>
              <p className="landing-feature-body">
                Electronics, cameras, instruments, fashion, books, furniture.
                If it has value, it can be traded.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── Final CTA — hidden when already logged in ── */}
      {!loggedIn && (
        <section className="landing-cta-section">
          <div className="landing-section-inner landing-cta-inner">
            <h2 className="landing-cta-heading">Ready to make your first trade?</h2>
            <p className="landing-cta-body">
              {stats && stats.traders > 0
                ? `Join ${fmt(stats.traders)} trader${stats.traders !== 1 ? 's' : ''} already on Swaparr. No credit card, no fees, no friction.`
                : 'Be one of the first traders on Swaparr. No credit card, no fees, no friction.'}
            </p>
            <button className="landing-cta-primary landing-cta-large" onClick={onGetStarted}>
              Create your free account
            </button>
          </div>
        </section>
      )}

      {/* ── Footer — hidden when embedded inside the app shell ── */}
      {!embedded && (
        <footer className="landing-footer">
          <span className="landing-nav-logo" style={{ gap: 8 }}>
            <span className="logo-mark" style={{ width: 26, height: 26, fontSize: 10 }}>SW</span>
            <span className="logo-wordmark" style={{ fontSize: 15 }}>Swaparr</span>
          </span>
          <p className="landing-footer-copy">
            &copy; 2026 Swaparr. Built in Amman, for Amman.
          </p>
          <div className="landing-footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </footer>
      )}

    </div>
  );
}
