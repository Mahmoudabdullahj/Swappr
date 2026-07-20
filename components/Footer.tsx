'use client';

const FOOTER_CATEGORIES = [
  { slug: 'mobiles',     name: 'Phones' },
  { slug: 'laptops',     name: 'Laptops' },
  { slug: 'gaming',      name: 'Gaming' },
  { slug: 'cameras',     name: 'Cameras' },
  { slug: 'headphones',  name: 'Headphones' },
  { slug: 'fashion',     name: 'Fashion' },
  { slug: 'furniture',   name: 'Furniture' },
];

interface FooterProps {
  onCategorySelect: (slug: string) => void;
}

export default function Footer({ onCategorySelect }: FooterProps) {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <img src="/logo-footer.png" alt="Baddel" width={201} height={53} className="footer-logo" />
          <p className="footer-desc">
            A local barter marketplace for Amman. No money changes hands — just fair direct trades between people near you.
          </p>
          <p className="footer-copy">© {new Date().getFullYear()} Baddel. All rights reserved.</p>
        </div>

        {/* Browse */}
        <div className="footer-col">
          <h4 className="footer-col-title">Browse</h4>
          <ul className="footer-links" role="list">
            {FOOTER_CATEGORIES.map(({ slug, name }) => (
              <li key={slug}>
                <button className="footer-link" onClick={() => onCategorySelect(slug)}>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul className="footer-links" role="list">
            <li><a className="footer-link" href="/terms">Terms of Service</a></li>
            <li><a className="footer-link" href="/privacy">Privacy Policy</a></li>
            <li><a className="footer-link" href="mailto:hello@baddel.shop">Contact Us</a></li>
          </ul>
        </div>

        {/* Follow */}
        <div className="footer-col">
          <h4 className="footer-col-title">Follow Us</h4>
          <div className="footer-socials">
            <a className="footer-social-btn" href="https://instagram.com/baddel.shop" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="19" height="19" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a className="footer-social-btn" href="https://x.com/baddel_shop" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a className="footer-social-btn" href="https://tiktok.com/@baddel.shop" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.16 8.16 0 0 0 4.77 1.52V6.82a4.85 4.85 0 0 1-1-.13z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
