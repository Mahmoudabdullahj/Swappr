import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules and guidelines for using Swaparr.',
};

export default function TermsPage() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href="/" className="legal-logo">
          <span className="logo-mark" style={{ width: 28, height: 28, fontSize: 11 }}>SW</span>
          <span className="logo-wordmark" style={{ fontSize: 16 }}>Swaparr</span>
        </Link>
      </header>

      <main className="legal-content">
        <h1>Terms of Service</h1>
        <p className="legal-date">Last updated: July 2026</p>

        <p>These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Swaparr. By creating an account or using the platform, you agree to these Terms. If you do not agree, please do not use Swaparr.</p>

        <h2>1. What Swaparr Is</h2>
        <p>Swaparr is a platform that lets people in Amman, Jordan list items they own and arrange direct, in-person trades with other users. <strong>No money changes hands through Swaparr.</strong> All transactions are barter only. We are a marketplace, not a party to any trade.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 13 years old to use Swaparr. By registering, you confirm that you meet this requirement.</p>

        <h2>3. Your Account</h2>
        <ul>
          <li>You are responsible for keeping your password secure.</li>
          <li>You may not create accounts on behalf of others without their permission.</li>
          <li>One person, one account. Duplicate accounts may be removed.</li>
        </ul>

        <h2>4. Listing Rules</h2>
        <p>When you post a listing, you confirm that:</p>
        <ul>
          <li>You own the item or have the right to trade it.</li>
          <li>The description and photos accurately represent the item&apos;s condition.</li>
          <li>The item is legal to own and trade in Jordan.</li>
        </ul>
        <p>The following are prohibited:</p>
        <ul>
          <li>Weapons, controlled substances, or any item illegal under Jordanian law.</li>
          <li>Counterfeit or stolen goods.</li>
          <li>Adult content or services.</li>
          <li>Listings intended to defraud or mislead other users.</li>
        </ul>

        <h2>5. Trades &amp; Meetings</h2>
        <p>Swaparr facilitates the introduction between traders but is not responsible for what happens during or after a trade. We strongly recommend:</p>
        <ul>
          <li>Meeting in a public place in daylight.</li>
          <li>Inspecting items before completing a swap.</li>
          <li>Bringing a friend if you are trading high-value items.</li>
        </ul>

        <h2>6. Prohibited Conduct</h2>
        <ul>
          <li>Harassing, threatening, or abusing other users.</li>
          <li>Spamming or sending unsolicited bulk messages.</li>
          <li>Attempting to circumvent any security measures of the platform.</li>
          <li>Using the platform for any commercial resale or cash transactions.</li>
        </ul>

        <h2>7. Content Ownership</h2>
        <p>You retain ownership of photos and descriptions you post. By posting them, you grant Swaparr a non-exclusive, royalty-free licence to display them on the platform. You may delete your listings at any time.</p>

        <h2>8. Enforcement</h2>
        <p>We reserve the right to remove any listing or suspend any account that violates these Terms, at our sole discretion, without prior notice.</p>

        <h2>9. Disclaimer of Warranties</h2>
        <p>Swaparr is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee the quality, safety, or legality of any item listed, or that any trade will be completed successfully.</p>

        <h2>10. Limitation of Liability</h2>
        <p>To the maximum extent permitted by Jordanian law, Swaparr and its team are not liable for any damages arising from your use of the platform, including disputes between users or losses from trades.</p>

        <h2>11. Governing Law</h2>
        <p>These Terms are governed by the laws of the Hashemite Kingdom of Jordan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Amman.</p>

        <h2>12. Changes to These Terms</h2>
        <p>We may update these Terms from time to time. Continued use of Swaparr after changes are posted constitutes your acceptance of the new Terms.</p>

        <h2>13. Contact</h2>
        <p>Questions about these Terms? Email us at <a href="mailto:hello@swappr.jo">hello@swappr.jo</a>.</p>
      </main>

      <footer className="legal-footer">
        <p>&copy; 2026 Swaparr. Built in Amman, for Amman.</p>
        <div className="legal-footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
