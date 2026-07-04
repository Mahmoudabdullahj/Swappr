'use client';

import { useState } from 'react';
import {
  Cpu,
  Laptop,
  Camera,
  Gamepad2,
  Watch,
  Car,
  Guitar,
  Shirt,
  BookOpen,
  Dumbbell,
  Sofa,
  Puzzle,
  type LucideIcon,
} from 'lucide-react';

interface Category {
  slug: string;
  name: string;
  Icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  { slug: 'electronics', name: 'Electronics',  Icon: Cpu       },
  { slug: 'laptops',     name: 'Laptops',       Icon: Laptop    },
  { slug: 'cameras',     name: 'Cameras',       Icon: Camera    },
  { slug: 'gaming',      name: 'Gaming',        Icon: Gamepad2  },
  { slug: 'watches',     name: 'Smartwatches',  Icon: Watch     },
  { slug: 'cars',        name: 'Cars',          Icon: Car       },
  { slug: 'instruments', name: 'Instruments',   Icon: Guitar    },
  { slug: 'fashion',     name: 'Fashion',       Icon: Shirt     },
  { slug: 'books',       name: 'Books',         Icon: BookOpen  },
  { slug: 'sports',      name: 'Sports',        Icon: Dumbbell  },
  { slug: 'furniture',   name: 'Furniture',     Icon: Sofa      },
  { slug: 'toys',        name: 'Toys',          Icon: Puzzle    },
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
        {CATEGORIES.map(({ slug, name, Icon }) => (
          <button
            key={slug}
            className={`category-card${active === slug ? ' active' : ''}`}
            role="listitem"
            aria-pressed={active === slug}
            aria-label={name}
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
