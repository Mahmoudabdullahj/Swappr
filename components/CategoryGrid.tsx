'use client';

import { useState } from 'react';

interface Category {
  slug: string;
  name: string;
  emoji: string;
  /** Drop your own image into /public/images/categories/ and set this path */
  imgSrc?: string;
}

const CATEGORIES: Category[] = [
  { slug: 'electronics', name: 'Electronics',  emoji: '📱' },
  { slug: 'laptops',     name: 'Laptops',       emoji: '💻' },
  { slug: 'cameras',     name: 'Cameras',       emoji: '📷' },
  { slug: 'gaming',      name: 'Gaming',        emoji: '🎮' },
  { slug: 'watches',     name: 'Smartwatches',  emoji: '⌚' },
  { slug: 'cars',        name: 'Cars',          emoji: '🚗' },
  { slug: 'instruments', name: 'Instruments',   emoji: '🎸' },
  { slug: 'fashion',     name: 'Fashion',       emoji: '👟' },
  { slug: 'books',       name: 'Books',         emoji: '📚' },
  { slug: 'sports',      name: 'Sports',        emoji: '⚽' },
  { slug: 'furniture',   name: 'Furniture',     emoji: '🪑' },
  { slug: 'toys',        name: 'Toys',          emoji: '🧸' },
];

interface CategoryGridProps {
  onSelect?: (slug: string) => void;
}

export default function CategoryGrid({ onSelect }: CategoryGridProps) {
  const [active, setActive] = useState<string | null>(null);

  function handleSelect(slug: string) {
    setActive((prev) => (prev === slug ? null : slug));
    onSelect?.(slug);
  }

  return (
    <section className="category-section" aria-labelledby="categoriesHeading">

      <header className="section-header">
        <h2 className="section-title" id="categoriesHeading">Browse by Categories</h2>
        <span className="section-link" style={{ cursor: 'default', opacity: 0.4 }} aria-hidden="true">See all →</span>
      </header>

      <div className="category-grid" role="list">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            className={`category-card${active === cat.slug ? ' active' : ''}`}
            role="listitem"
            aria-pressed={active === cat.slug}
            aria-label={cat.name}
            onClick={() => handleSelect(cat.slug)}
          >
            {cat.imgSrc ? (
              /* Replace emoji with a real image once assets are in /public/images/categories/ */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cat.imgSrc}
                alt={cat.name}
                className="category-icon"
                width={52}
                height={52}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <span className="category-icon" aria-hidden="true">{cat.emoji}</span>
            )}
            <span className="category-name">{cat.name}</span>
          </button>
        ))}
      </div>

    </section>
  );
}
