'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { CatalogItem, UserSession } from '@/lib/types';
import LandingPage from '@/components/LandingPage';
import CategoryGrid from '@/components/CategoryGrid';
import TrendingFeed from '@/components/TrendingFeed';
import ItemCard from '@/components/ItemCard';

const CATEGORY_NAMES: Record<string, string> = {
  mobiles:     'Mobiles',
  electronics: 'Electronics',
  laptops:     'Laptops',
  cameras:     'Cameras',
  gaming:      'Gaming',
  watches:     'Smartwatches',
  cars:        'Cars',
  headphones:  'Headphones',
  instruments: 'Instruments',
  fashion:     'Fashion',
  books:       'Books',
  sports:      'Sports',
  furniture:   'Furniture',
  toys:        'Toys',
};

const CATEGORY_TAGLINES: Record<string, string> = {
  mobiles:     'Phones & mobile devices',
  electronics: 'TVs, audio & smart home',
  laptops:     'Work & play anywhere',
  cameras:     'Capture every moment',
  gaming:      'Level up your setup',
  watches:     'Style meets smart tech',
  cars:        'Drive something new',
  headphones:  'Sound without limits',
  instruments: 'Make music, trade gear',
  fashion:     'Fresh style, fair trade',
  books:       'Stories worth sharing',
  sports:      'Gear up & get active',
  furniture:   'Transform your space',
  toys:        'Fun for all ages',
};

const CATEGORY_IMAGES: Record<string, string> = {
  mobiles:     '/categories/Mobiles.png',
  laptops:     '/categories/Laptops.png',
  cameras:     '/categories/Cameras.png',
  gaming:      '/categories/Gaming.png',
  watches:     '/categories/Smartwatches.png',
  cars:        '/categories/Cars.png',
  instruments: '/categories/Instruments.png',
  fashion:     '/categories/Fashion.png',
  books:       '/categories/Books.png',
  sports:      '/categories/Sports.png',
  furniture:   '/categories/Furniture.png',
  toys:        '/categories/Toys.png',
  electronics: '/categories/Electronics.png',
  headphones:  '/categories/Headphones.png',
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
  mobiles:     'Phones',
  electronics: 'Electronics',
  cameras:     'Cameras',
  gaming:      'Gaming',
  instruments: 'Instruments',
  fashion:     'Fashion',
  laptops:     'Laptops',
  watches:     'Smartwatches',
  cars:        'Cars',
  headphones:  'Headphones',
  books:       'Books',
  sports:      'Sports',
  furniture:   'Furniture',
  toys:        'Toys',
};

interface DiscoverViewProps {
  session: UserSession | null;
  loggedIn: boolean;
  authLoading: boolean;
  likedIds: Set<string>;
  onLikeToggle: (item: CatalogItem, liked: boolean) => void;
  onOfferTrade: (item: CatalogItem) => void;
  onViewChange: (view: string) => void;
  onListItem: (skipWant?: boolean) => void;
  searchQuery: string;
  searchResults: CatalogItem[];
  isSearching: boolean;
  mobileSearchOpen: boolean;
}

export default function DiscoverView({
  session,
  loggedIn,
  authLoading,
  likedIds,
  onLikeToggle,
  onOfferTrade,
  onViewChange,
  onListItem,
  searchQuery,
  searchResults,
  isSearching,
  mobileSearchOpen: _mobileSearchOpen,
}: DiscoverViewProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [discoverSubView, setDiscoverSubView] = useState<'exact-matches' | 'trending' | null>(null);
  const [categoryItems, setCategoryItems] = useState<CatalogItem[]>([]);
  const [allFeedItems, setAllFeedItems] = useState<CatalogItem[]>([]);

  useEffect(() => {
    if (!activeCategory) { setCategoryItems([]); return; }
    const cat = CATEGORY_SLUG_MAP[activeCategory];
    if (!cat) { setCategoryItems([]); return; }
    fetch(`/api/items?category=${encodeURIComponent(cat)}&limit=50`)
      .then((r) => r.json())
      .then(setCategoryItems)
      .catch(() => setCategoryItems([]));
  }, [activeCategory]);

  useEffect(() => {
    if (discoverSubView !== 'trending') return;
    fetch('/api/items?limit=100')
      .then((r) => r.json())
      .then(setAllFeedItems)
      .catch(() => setAllFeedItems([]));
  }, [discoverSubView]);

  // Trigger category card entrance when the section scrolls into view
  useEffect(() => {
    const el = document.querySelector('.cat-section');
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('cat-section-visible'); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loggedIn, activeCategory]);

  // ── SEARCH RESULTS VIEW ──
  if (isSearching) {
    return (
      <main className="content" id="view-search">
        <header className="section-header">
          <h2 className="section-title">Results for &ldquo;{searchQuery}&rdquo;</h2>
          <span className="section-count">{searchResults.length} item{searchResults.length !== 1 ? 's' : ''}</span>
        </header>
        {searchResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-text">No items found for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <div className="item-grid" role="list">
            {searchResults.map((item) => (
              <ItemCard key={item.id} {...item} liked={likedIds.has(item.id)} onLike={(l) => onLikeToggle(item, l)} onOfferTrade={() => onOfferTrade(item)} />
            ))}
          </div>
        )}
      </main>
    );
  }

  // ── CATEGORY VIEW ──
  if (activeCategory) {
    return (
      <main className="content" id="view-category">
        <div className="category-page-header">
          <button className="back-btn" onClick={() => setActiveCategory(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="category-page-title">
            {CATEGORY_NAMES[activeCategory] ?? activeCategory}
          </h1>
          <span className="category-item-count">{categoryItems.length} listings</span>
        </div>

        <div className="item-grid" role="list">
          {categoryItems.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-text">
                No listings in this category yet.<br />Be the first to list something!
              </p>
              <button
                className="btn-primary"
                style={{ marginTop: 20, display: 'inline-flex' }}
                onClick={() => onListItem()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                List an Item
              </button>
            </div>
          ) : (
            categoryItems.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                category={item.category}
                condition={item.condition}
                img={item.img}
                seller={item.seller}
                dist={item.dist}
                liked={likedIds.has(item.id)}
                onLike={(l) => onLikeToggle(item, l)}
                onOfferTrade={() => onOfferTrade(item)}
              />
            ))
          )}
        </div>
      </main>
    );
  }

  // ── DISCOVER: Exact Matches full page ──
  if (discoverSubView === 'exact-matches') {
    return (
      <main className="content" id="view-exact-matches">
        <div className="feed-page-header">
          <button className="back-btn" onClick={() => setDiscoverSubView(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="feed-page-title">Exact Matches</h1>
            <p className="feed-page-sub">Coming soon</p>
          </div>
        </div>
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="empty-state-icon">🤝</div>
          <p className="empty-state-text">Exact match alerts are coming soon.</p>
        </div>
      </main>
    );
  }

  // ── DISCOVER: Trending full page ──
  if (discoverSubView === 'trending') {
    return (
      <main className="content" id="view-trending">
        <div className="feed-page-header">
          <button className="back-btn" onClick={() => setDiscoverSubView(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="feed-page-title">Trending Near You</h1>
            <p className="feed-page-sub">Popular items in your area · {allFeedItems.length} listings</p>
          </div>
        </div>
        <div className="item-grid" role="list">
          {allFeedItems.map((item) => (
            <ItemCard key={item.id} {...item} liked={likedIds.has(item.id)} onLike={(l) => onLikeToggle(item, l)} onOfferTrade={() => onOfferTrade(item)} />
          ))}
        </div>
      </main>
    );
  }

  // ── Auth loading spinner ──
  if (authLoading) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 66px)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} aria-label="Loading" role="status" />
      </main>
    );
  }

  // ── Bento home (logged in) ──
  if (loggedIn) {
    return (
      <main className="bento-page" id="view-discover">
        <div className="bento-home">

          {/* Hero box — click → My Items */}
          <div
            className="bento-hero"
            onClick={() => onViewChange('items')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onViewChange('items')}
            aria-label="Go to My Items"
          >
            <video
              className="bento-hero-video"
              src="/hero.mp4"
              autoPlay
              muted
              loop
              playsInline
              poster="/hero-poster.webp"
              preload="none"
            />
            <div className="bento-hero-overlay" />
            <h1 className="bento-headline">Trade what you have,<br/>get what you need.</h1>
            <div className="bento-hero-footer">
              <button
                className="bento-list-btn"
                onClick={(e) => { e.stopPropagation(); onListItem(); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                List an Item
              </button>
              <div className="bento-hero-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </div>
            </div>
          </div>

        </div>{/* end bento-home grid */}

        {/* ── Category section ── */}
        <section className="cat-section">
          <h2 className="cat-section-title">Browse by Category</h2>
          <div className="cat-grid">
            {Object.entries(CATEGORY_NAMES).map(([slug, name], i) => (
              <div
                key={slug}
                className={`cat-card${CATEGORY_IMAGES[slug] ? ' cat-card-has-img' : ''}`}
                onClick={() => setActiveCategory(slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveCategory(slug)}
                aria-label={`Browse ${name}`}
              >
                {CATEGORY_IMAGES[slug] && (
                  <Image
                    src={CATEGORY_IMAGES[slug]}
                    alt=""
                    fill
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 400px"
                    className="cat-card-bg"
                    aria-hidden="true"
                  />
                )}
                <div className="cat-card-body">
                  <div>
                    <span className="cat-num">{String(i + 1).padStart(2, '0')}.</span>
                    <h3 className="cat-name">{name.toUpperCase()}</h3>
                  </div>
                  <div>
                    <div className="cat-shop-btn">Browse {name}</div>
                    <p className="cat-tagline">{CATEGORY_TAGLINES[slug]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trending Near You ── */}
        <div className="trending-dark-wrap">
          <TrendingFeed
            session={session}
            onOfferTrade={(item) => onOfferTrade(item)}
            onSeeAll={() => onViewChange('discover')}
            likedIds={likedIds}
            onLikeToggle={onLikeToggle}
          />
        </div>

      </main>
    );
  }

  // ── Landing page for guests ──
  return (
    <LandingPage embedded loggedIn={loggedIn}>
      <main className="content" id="view-discover">
        <CategoryGrid activeSlug={activeCategory} onSelect={(slug) => setActiveCategory(slug)} />
      </main>
    </LandingPage>
  );
}
