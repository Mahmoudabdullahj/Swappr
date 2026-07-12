'use client';

import { CATEGORY_ICONS, type LucideIcon } from '@/lib/category-icons';

interface Category {
  slug: string;
  name: string;
  Icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  { slug: 'mobiles',     name: 'Mobiles',       Icon: CATEGORY_ICONS['Phones']       },
  { slug: 'electronics', name: 'Electronics',   Icon: CATEGORY_ICONS['Electronics']  },
  { slug: 'laptops',     name: 'Laptops',       Icon: CATEGORY_ICONS['Laptops']      },
  { slug: 'cameras',     name: 'Cameras',       Icon: CATEGORY_ICONS['Cameras']      },
  { slug: 'gaming',      name: 'Gaming',        Icon: CATEGORY_ICONS['Gaming']       },
  { slug: 'watches',     name: 'Smartwatches',  Icon: CATEGORY_ICONS['Smartwatches'] },
  { slug: 'cars',        name: 'Cars',          Icon: CATEGORY_ICONS['Cars']         },
  { slug: 'instruments', name: 'Instruments',   Icon: CATEGORY_ICONS['Instruments']  },
  { slug: 'fashion',     name: 'Fashion',       Icon: CATEGORY_ICONS['Fashion']      },
  { slug: 'books',       name: 'Books',         Icon: CATEGORY_ICONS['Books']        },
  { slug: 'sports',      name: 'Sports',        Icon: CATEGORY_ICONS['Sports']       },
  { slug: 'furniture',   name: 'Furniture',     Icon: CATEGORY_ICONS['Furniture']    },
  { slug: 'toys',        name: 'Toys',          Icon: CATEGORY_ICONS['Toys']         },
];

interface CategoryGridProps {
  activeSlug?: string | null;
  onSelect?: (slug: string | null) => void;
}

export default function CategoryGrid({ activeSlug, onSelect }: CategoryGridProps) {
  function handleSelect(slug: string) {
    onSelect?.(activeSlug === slug ? null : slug);
  }

  return (
    <section className="category-section" aria-labelledby="categoriesHeading">

      <header className="section-header">
        <h2 className="section-title" id="categoriesHeading">Browse by Categories</h2>
        <span className="section-link" style={{ cursor: 'default', opacity: 0.4 }} aria-hidden="true">See all →</span>
      </header>

      <div className="category-grid" role="list">
        {CATEGORIES.map(({ slug, name, Icon }) => (
          <button
            key={slug}
            className={`category-card${activeSlug === slug ? ' active' : ''}`}
            aria-label={name}
            aria-current={activeSlug === slug ? 'true' : undefined}
            onClick={() => handleSelect(slug)}
          >
            <span className="category-icon" aria-hidden="true">
              <Icon size={28} strokeWidth={1.5} />
            </span>
            <span className="category-name">{name}</span>
          </button>
        ))}
      </div>

    </section>
  );
}
