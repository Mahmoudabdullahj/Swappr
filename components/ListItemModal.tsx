'use client';

import { useState, useRef } from 'react';
import { MyItems } from '@/lib/my-items';
import { Session } from '@/lib/session';

interface ListingDraft {
  images: File[];
  title: string;
  category: string;
  condition: string;
  price: string;
  description: string;
  wantTitle: string;
  wantCategory: string;
  wantAnything: boolean;
}

interface ListItemModalProps {
  open: boolean;
  onClose: () => void;
  onListed?: () => void;
  skipWantStep?: boolean;
}

const CATEGORIES = [
  'Electronics', 'Laptops', 'Cameras', 'Gaming', 'Smartwatches',
  'Headphones', 'Instruments', 'Fashion', 'Books', 'Sports', 'Furniture', 'Toys', 'Other',
];

const CONDITIONS = [
  { value: 'new',      label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good',     label: 'Good' },
];

const INITIAL: ListingDraft = {
  images: [], title: '', category: '', condition: '', price: '',
  description: '', wantTitle: '', wantCategory: '', wantAnything: false,
};

export default function ListItemModal({ open, onClose, onListed, skipWantStep }: ListItemModalProps) {
  const [step, setStep]           = useState<1 | 2>(1);
  const [draft, setDraft]         = useState<ListingDraft>(INITIAL);
  const [previews, setPreviews]   = useState<string[]>([]);
  const [dragOver, setDragOver]   = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep(1);
    setDraft(INITIAL);
    previews.forEach(URL.revokeObjectURL);
    setPreviews([]);
    setErrors({});
    setDragOver(false);
    setSubmitting(false);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const slots = 5 - draft.images.length;
    if (slots <= 0) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, slots);
    if (!valid.length) return;
    setDraft(d => ({ ...d, images: [...d.images, ...valid] }));
    setPreviews(p => [...p, ...valid.map(f => URL.createObjectURL(f))]);
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(previews[idx]);
    setDraft(d => ({ ...d, images: d.images.filter((_, i) => i !== idx) }));
    setPreviews(p => p.filter((_, i) => i !== idx));
  }

  function validateStep1() {
    const errs: Record<string, string> = {};
    if (!draft.title.trim()) errs.title = 'Title is required';
    if (!draft.condition)    errs.condition = 'Condition is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs: Record<string, string> = {};
    if (!draft.wantAnything && !draft.wantTitle.trim())
      errs.wantTitle = 'Please describe what you want, or choose "Open to anything"';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submitListing() {
    setSubmitting(true);
    setErrors({});
    try {
      const s = Session.get();
      const fd = new FormData();
      fd.append('title',     draft.title);
      fd.append('category',  draft.category || 'Other');
      fd.append('condition', draft.condition || 'good');
      fd.append('price',     draft.price || '0');
      fd.append('userId',    s?.userId || 'anonymous');
      fd.append('seller',    s?.displayName || 'Anonymous');
      if (draft.images[0]) fd.append('image', draft.images[0]);

      const res = await fetch('/api/items', { method: 'POST', body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save item');
      }

      MyItems.add({ title: draft.title, category: draft.category });
      onListed?.();
      handleClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to save. Try again.' });
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (!validateStep1()) return;
    setErrors({});
    if (skipWantStep) { submitListing(); } else { setStep(2); }
  }

  function handleSubmit() {
    if (!validateStep2()) return;
    submitListing();
  }

  return (
    <div
      className={`list-modal-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="listModalTitle"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="list-modal">

        {/* Header */}
        <div className="list-modal-header">
          {!skipWantStep && (
            <div className="list-modal-steps" aria-label={`Step ${step} of 2`}>
              <span className={`list-step${step === 1 ? ' active' : ' done'}`}>
                {step > 1 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : '1'}
              </span>
              <span className="list-step-line" />
              <span className={`list-step${step === 2 ? ' active' : ''}`}>2</span>
            </div>
          )}
          <h2 className="list-modal-title" id="listModalTitle">
            {step === 1 ? 'List Your Item' : 'What You Want'}
          </h2>
          <button className="list-modal-close" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="list-modal-body">

            {/* Image upload */}
            <div
              className={`list-upload-area${dragOver ? ' drag-over' : ''}${previews.length > 0 ? ' has-images' : ''}`}
              onClick={() => previews.length === 0 && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />

              {previews.length === 0 ? (
                <>
                  <div className="list-upload-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="list-upload-label">Click or drag photos here</p>
                  <p className="list-upload-sub">Up to 5 images · JPG, PNG, WEBP</p>
                </>
              ) : (
                <div className="list-image-previews" onClick={e => e.stopPropagation()}>
                  {previews.map((src, i) => (
                    <div key={i} className="list-preview-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button className="list-preview-remove" onClick={() => removeImage(i)} aria-label={`Remove image ${i + 1}`}>×</button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button className="list-preview-add" onClick={() => fileInputRef.current?.click()} aria-label="Add more photos">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="list-field">
              <label className="list-label" htmlFor="listTitle">Title</label>
              <input id="listTitle" className={`list-input${errors.title ? ' error' : ''}`}
                type="text" placeholder="e.g. Sony WH-1000XM5 Headphones"
                value={draft.title}
                onChange={e => { setDraft(d => ({ ...d, title: e.target.value })); setErrors(er => ({ ...er, title: '' })); }} />
              {errors.title && <p className="list-error" role="alert">{errors.title}</p>}
            </div>

            {/* Category */}
            <div className="list-field">
              <label className="list-label" htmlFor="listCategory">Category</label>
              <select id="listCategory" className="list-select" value={draft.category}
                onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}>
                <option value="">Select a category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Condition */}
            <div className="list-field">
              <label className="list-label">Condition</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {CONDITIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setDraft(d => ({ ...d, condition: value })); setErrors(er => ({ ...er, condition: '' })); }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: `2px solid ${draft.condition === value ? 'var(--accent)' : 'var(--border)'}`,
                      background: draft.condition === value ? 'var(--accent-dim)' : 'transparent',
                      color: draft.condition === value ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .15s',
                    }}
                  >{label}</button>
                ))}
              </div>
              {errors.condition && <p className="list-error" role="alert">{errors.condition}</p>}
            </div>

            {/* Price */}
            <div className="list-field">
              <label className="list-label" htmlFor="listPrice">
                Estimated value <span className="list-label-opt">(JD, optional)</span>
              </label>
              <input id="listPrice" className="list-input" type="number" min="0" placeholder="e.g. 150"
                value={draft.price}
                onChange={e => setDraft(d => ({ ...d, price: e.target.value }))} />
            </div>

            {/* Description */}
            <div className="list-field">
              <label className="list-label" htmlFor="listDesc">Description <span className="list-label-opt">(optional)</span></label>
              <textarea id="listDesc" className="list-textarea"
                placeholder="Describe the condition, age, what's included…"
                rows={3} value={draft.description}
                onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
            </div>

            {errors.submit && <p className="list-error" role="alert">{errors.submit}</p>}

            <button className="list-continue-btn" onClick={handleContinue} disabled={submitting}>
              {submitting ? 'Saving…' : skipWantStep ? 'List Item' : 'Continue'}
              {!submitting && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                  {skipWantStep ? <polyline points="20 6 9 17 4 12" /> : <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>}
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="list-modal-body">
            <p className="list-step2-intro">
              Tell us what you&apos;d like in return — we&apos;ll notify you when someone with a matching item wants yours.
            </p>

            <button type="button"
              className={`list-anything-btn${draft.wantAnything ? ' active' : ''}`}
              onClick={() => setDraft(d => ({ ...d, wantAnything: !d.wantAnything, wantTitle: '', wantCategory: '' }))}
              aria-pressed={draft.wantAnything}>
              <span className="list-anything-check" aria-hidden="true">
                {draft.wantAnything
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12" /></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                }
              </span>
              Open to anything
            </button>

            <div className={`list-field${draft.wantAnything ? ' list-field-disabled' : ''}`}>
              <label className="list-label" htmlFor="wantTitle">What item do you want?</label>
              <input id="wantTitle" className={`list-input${errors.wantTitle ? ' error' : ''}`}
                type="text" placeholder="e.g. Fujifilm X-T30, iPad Pro, Acoustic Guitar…"
                value={draft.wantTitle} autoFocus disabled={draft.wantAnything}
                onChange={e => { setDraft(d => ({ ...d, wantTitle: e.target.value })); setErrors(er => ({ ...er, wantTitle: '' })); }} />
              {errors.wantTitle && <p className="list-error" role="alert">{errors.wantTitle}</p>}
            </div>

            <div className={`list-field${draft.wantAnything ? ' list-field-disabled' : ''}`}>
              <label className="list-label" htmlFor="wantCategory">Category <span className="list-label-opt">(optional)</span></label>
              <select id="wantCategory" className="list-select" value={draft.wantCategory}
                disabled={draft.wantAnything}
                onChange={e => setDraft(d => ({ ...d, wantCategory: e.target.value }))}>
                <option value="">Select a category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {errors.submit && <p className="list-error" role="alert">{errors.submit}</p>}

            <div className="list-step2-actions">
              <button className="list-back-btn" onClick={() => { setErrors({}); setStep(1); }} disabled={submitting}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
                  <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                </svg>
                Back
              </button>
              <button className="list-submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving…' : 'List Item'}
                {!submitting && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
