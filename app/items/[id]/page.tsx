import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import OfferTradeButton from '@/components/OfferTradeButton';

const CONDITION_LABEL: Record<string, string> = {
  'new': 'New', 'brand-new': 'New', 'like-new': 'Like New',
  'good': 'Good', 'fair': 'Fair', 'parts': 'For Parts',
};

const CONDITION_CLASS: Record<string, string> = {
  'new': 'condition-new', 'brand-new': 'condition-new',
  'like-new': 'condition-likenew', 'good': 'condition-good', 'fair': 'condition-fair',
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient();
  const { data: item } = await supabase.from('items').select('title, category, seller').eq('id', params.id).single();
  if (!item) return { title: 'Item not found' };
  return {
    title: `${item.title} | ${item.category}`,
    description: `${item.title} listed by ${item.seller} on Swaparr. No money, just fair trades.`,
  };
}

export default async function ItemPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: item } = await supabase.from('items').select('*').eq('id', params.id).single();

  if (!item) notFound();

  const condKey   = item.condition?.toLowerCase() ?? 'good';
  const condLabel = CONDITION_LABEL[condKey] ?? item.condition;
  const condClass = CONDITION_CLASS[condKey] ?? 'condition-good';

  return (
    <main className="item-detail-page">
      <div className="item-detail-container">
        <Link href="/" className="item-detail-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </Link>

        <div className="item-detail-layout">
          <div className="item-detail-image-wrap">
            {item.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.img} alt={item.title} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '1', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, fontSize: 64 }}>
                📦
              </div>
            )}
            <span className={`card-condition-badge ${condClass}`}>{condLabel}</span>
          </div>

          <div className="item-detail-info">
            <p className="item-detail-category">{item.category}</p>
            <h1 className="item-detail-title">{item.title}</h1>

            <div className="item-detail-seller">
              {item.seller_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.seller_avatar} alt={item.seller} className="item-detail-avatar" />
              ) : (
                <div className="item-detail-avatar" style={{ background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                  {item.seller?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="item-detail-seller-info">
                <span className="item-detail-seller-name">{item.seller}</span>
                {item.city && (
                  <span className="item-detail-seller-location">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" width="11" height="11" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {item.city}
                  </span>
                )}
              </div>
            </div>


            {item.description && (
              <div className="item-detail-desc">
                <p className="item-detail-wants-label">Description</p>
                <p className="item-detail-desc-text">{item.description}</p>
              </div>
            )}

            {(item.want_anything || item.want_title || item.want_category) && (
              <div className="item-detail-wants">
                <p className="item-detail-wants-label">Looking for in return</p>
                <p className="item-detail-wants-value">
                  {item.want_anything ? 'Open to anything' : (item.want_title || item.want_category)}
                </p>
              </div>
            )}

            <OfferTradeButton item={{ id: item.id, title: item.title, category: item.category, img: item.img || '', seller: item.seller, user_id: item.user_id }} />
          </div>
        </div>
      </div>
    </main>
  );
}
