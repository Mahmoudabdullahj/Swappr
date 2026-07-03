'use client';

import { useState, useRef, useMemo } from 'react';
import { Session } from '@/lib/session';
import { CATALOG, CategoryConfig } from '@/lib/item-catalog';

interface ListItemModalProps {
  open: boolean;
  onClose: () => void;
  onListed?: () => void;
  skipWantStep?: boolean;
}

const CONDITIONS = [
  { value: 'new',      label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good',     label: 'Good' },
];

const STEP_TITLES: Record<string, string> = {
  category: 'List Your Item',
  brand:    'Brand',
  model:    'Model',
  specs:    'Item Specs',
  details:  'Photos & Info',
  wants:    'What Do You Want?',
};

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ListItemModal({ open, onClose, onListed, skipWantStep }: ListItemModalProps) {
  const [currentStep, setCurrentStep]         = useState('category');
  const [selectedCatSlug, setSelectedCatSlug] = useState('');
  const [selectedBrand, setSelectedBrand]     = useState('');
  const [selectedModel, setSelectedModel]     = useState('');
  const [specs, setSpecs]                     = useState<Record<string, string>>({});
  const [modelSearch, setModelSearch]         = useState('');

  const [images, setImages]           = useState<File[]>([]);
  const [previews, setPreviews]       = useState<string[]>([]);
  const [title, setTitle]             = useState('');
  const [condition, setCondition]     = useState('');
  const [price, setPrice]             = useState('');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver]       = useState(false);

  const [wantTitle, setWantTitle]       = useState('');
  const [wantCategory, setWantCategory] = useState('');
  const [wantAnything, setWantAnything] = useState(false);

  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cat: CategoryConfig | undefined = CATALOG.find(c => c.slug === selectedCatSlug);

  const allSteps = useMemo<string[]>(() => {
    const s: string[] = ['category'];
    if (cat) {
      if (cat.brands || cat.types) s.push('brand');
      if (cat.brands) s.push('model');
      if (cat.specs.length > 0) s.push('specs');
    }
    s.push('details');
    if (!skipWantStep) s.push('wants');
    return s;
  }, [cat, skipWantStep]);

  const stepIndex = allSteps.indexOf(currentStep);

  /* ── reset ── */
  function reset() {
    setCurrentStep('category');
    setSelectedCatSlug('');
    setSelectedBrand('');
    setSelectedModel('');
    setSpecs({});
    setModelSearch('');
    setImages([]);
    previews.forEach(URL.revokeObjectURL);
    setPreviews([]);
    setTitle('');
    setCondition('');
    setPrice('');
    setDescription('');
    setWantTitle('');
    setWantCategory('');
    setWantAnything(false);
    setErrors({});
    setSubmitting(false);
    setDragOver(false);
  }

  function handleClose() { onClose(); setTimeout(reset, 300); }

  /* ── step navigation ── */
  function handleCategorySelect(slug: string) {
    const newCat = CATALOG.find(c => c.slug === slug);
    setSelectedCatSlug(slug);
    setSelectedBrand('');
    setSelectedModel('');
    setSpecs({});
    setTitle('');
    if (newCat?.brands || newCat?.types) { setCurrentStep('brand'); return; }
    if (newCat && newCat.specs.length > 0) { setCurrentStep('specs'); return; }
    setCurrentStep('details');
  }

  function handleBrandSelect(brand: string) {
    setSelectedBrand(brand);
    setSelectedModel('');
    setModelSearch('');
    if (cat?.brands) { setCurrentStep('model'); return; }
    if (cat && cat.specs.length > 0) { setCurrentStep('specs'); return; }
    setCurrentStep('details');
  }

  function handleModelSelect(model: string) {
    setSelectedModel(model);
    setTitle(`${selectedBrand} ${model}`);
    if (cat && cat.specs.length > 0) { setCurrentStep('specs'); return; }
    setCurrentStep('details');
  }

  function goBack() {
    const prev = allSteps[stepIndex - 1];
    if (prev) { setErrors({}); setCurrentStep(prev); }
  }

  /* ── images ── */
  function addFiles(files: FileList | null) {
    if (!files) return;
    const slots = 5 - images.length;
    if (slots <= 0) return;
    const valid = Array.from(files)
      .filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024)
      .slice(0, slots);
    if (!valid.length) return;
    setImages(d => [...d, ...valid]);
    setPreviews(p => [...p, ...valid.map(f => URL.createObjectURL(f))]);
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(previews[idx]);
    setImages(d => d.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  }

  /* ── submit ── */
  function handleDetailsContinue() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title     = 'Title is required';
    if (!condition)    errs.condition = 'Condition is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (skipWantStep) { submitListing(); } else { setCurrentStep('wants'); }
  }

  function handleWantsSubmit() {
    const errs: Record<string, string> = {};
    if (!wantAnything && !wantTitle.trim())
      errs.wantTitle = 'Please describe what you want, or choose "Open to anything"';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    submitListing();
  }

  async function submitListing() {
    setSubmitting(true);
    setErrors({});
    try {
      const s = Session.get();
      const fd = new FormData();
      fd.append('title',        title);
      fd.append('category',     cat?.name || 'Other');
      fd.append('brand',        selectedBrand || '');
      fd.append('model',        selectedModel || '');
      fd.append('specs',        JSON.stringify(specs));
      fd.append('condition',    condition || 'good');
      fd.append('price',        price || '0');
      fd.append('userId',       s?.userId || 'anonymous');
      fd.append('seller',       s?.displayName || 'Anonymous');
      fd.append('wantTitle',    wantTitle || '');
      fd.append('wantCategory', wantCategory || '');
      fd.append('wantAnything', wantAnything ? 'true' : 'false');
      if (images[0]) fd.append('image', images[0]);

      const res = await fetch('/api/items', { method: 'POST', body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save item');
      }
      onListed?.();
      handleClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to save. Try again.' });
      setSubmitting(false);
    }
  }

  /* ── derived ── */
  const brandModels = cat?.brands?.find(b => b.name === selectedBrand)?.models ?? [];
  const filteredModels = modelSearch
    ? brandModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()))
    : brandModels;

  return (
    <div
      className={`list-modal-overlay${open ? ' open' : ''}`}
      role="dialog" aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="list-modal">

        {/* Header */}
        <div className="list-modal-header">
          {currentStep !== 'category' ? (
            <button className="list-back-icon-btn" onClick={goBack} aria-label="Go back">
              <BackArrow />
            </button>
          ) : (
            <div style={{ width: 32 }} />
          )}
          <h2 className="list-modal-title" style={{ flex: 1, textAlign: 'center' }}>
            {STEP_TITLES[currentStep] ?? 'List Your Item'}
          </h2>
          <button className="list-modal-close" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step dots (shown after category is picked) */}
        {selectedCatSlug && (
          <div className="list-step-dots-bar">
            {allSteps.map((s, i) => (
              <span
                key={s}
                className={`list-step-dot${i < stepIndex ? ' done' : i === stepIndex ? ' active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* ── STEP: category ── */}
        {currentStep === 'category' && (
          <div className="list-modal-body">
            <p className="list-step-hint">What are you listing?</p>
            <div className="list-cat-grid">
              {CATALOG.map(c => (
                <button
                  key={c.slug}
                  className={`list-cat-item${selectedCatSlug === c.slug ? ' selected' : ''}`}
                  onClick={() => handleCategorySelect(c.slug)}
                >
                  <span className="list-cat-emoji">{c.emoji}</span>
                  <span className="list-cat-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: brand / type ── */}
        {currentStep === 'brand' && (
          <div className="list-modal-body">
            <p className="list-step-hint">
              {cat?.brands ? 'Select a brand' : 'Select a type'}
            </p>
            <div className="list-brand-grid">
              {(cat?.brands?.map(b => b.name) ?? cat?.types ?? []).map(name => (
                <button
                  key={name}
                  className={`list-brand-card${selectedBrand === name ? ' selected' : ''}`}
                  onClick={() => handleBrandSelect(name)}
                >
                  <span>{name}</span>
                  {selectedBrand === name && (
                    <span className="list-brand-check"><CheckIcon /></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: model ── */}
        {currentStep === 'model' && (
          <div className="list-modal-body">
            <p className="list-step-hint">{selectedBrand}</p>
            {brandModels.length > 6 && (
              <input
                className="list-model-search"
                placeholder="Search models…"
                value={modelSearch}
                onChange={e => setModelSearch(e.target.value)}
                autoFocus
              />
            )}
            <div className="list-model-list">
              {filteredModels.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                  No models match your search
                </p>
              )}
              {filteredModels.map(model => (
                <button
                  key={model}
                  className={`list-model-item${selectedModel === model ? ' selected' : ''}`}
                  onClick={() => handleModelSelect(model)}
                >
                  <span>{model}</span>
                  {selectedModel === model ? <CheckIcon /> : <ChevronRight />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: specs ── */}
        {currentStep === 'specs' && (
          <div className="list-modal-body">
            {(selectedBrand || selectedModel) && (
              <div className="list-selected-summary">
                {selectedBrand && <span>{selectedBrand}</span>}
                {selectedModel && (
                  <><span className="list-summary-sep">›</span><span>{selectedModel}</span></>
                )}
              </div>
            )}
            {cat?.specs.map(field => (
              <div key={field.key} className="list-field">
                <label className="list-label">
                  {field.label}
                  {!field.required && <span className="list-label-opt"> (optional)</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    className="list-select"
                    value={specs[field.key] || ''}
                    onChange={e => setSpecs(s => ({ ...s, [field.key]: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    className="list-input"
                    type="text"
                    placeholder={field.placeholder || ''}
                    value={specs[field.key] || ''}
                    onChange={e => setSpecs(s => ({ ...s, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
            <button className="list-continue-btn" onClick={() => setCurrentStep('details')}>
              Continue
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* ── STEP: details ── */}
        {currentStep === 'details' && (
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
                type="text" placeholder="e.g. Apple MacBook Pro 14&quot; M4"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(er => ({ ...er, title: '' })); }} />
              {errors.title && <p className="list-error" role="alert">{errors.title}</p>}
            </div>

            {/* Condition */}
            <div className="list-field">
              <label className="list-label">Condition</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {CONDITIONS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => { setCondition(value); setErrors(er => ({ ...er, condition: '' })); }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10,
                      border: `2px solid ${condition === value ? 'var(--accent)' : 'var(--border)'}`,
                      background: condition === value ? 'var(--accent-dim)' : 'transparent',
                      color: condition === value ? 'var(--accent)' : 'var(--text-secondary)',
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
                value={price} onChange={e => setPrice(e.target.value)} />
            </div>

            {/* Description */}
            <div className="list-field">
              <label className="list-label" htmlFor="listDesc">
                Description <span className="list-label-opt">(optional)</span>
              </label>
              <textarea id="listDesc" className="list-textarea"
                placeholder="Describe the condition, age, what's included…"
                rows={3} value={description}
                onChange={e => setDescription(e.target.value)} />
            </div>

            {errors.submit && <p className="list-error" role="alert">{errors.submit}</p>}

            <button className="list-continue-btn" onClick={handleDetailsContinue} disabled={submitting}>
              {submitting ? 'Saving…' : skipWantStep ? 'List Item' : 'Continue'}
              {!submitting && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                  {skipWantStep
                    ? <polyline points="20 6 9 17 4 12" />
                    : <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>}
                </svg>
              )}
            </button>
          </div>
        )}

        {/* ── STEP: wants ── */}
        {currentStep === 'wants' && (
          <div className="list-modal-body">
            <p className="list-step2-intro">
              Tell us what you&apos;d like in return — we&apos;ll notify you when someone with a matching item wants yours.
            </p>

            <button type="button"
              className={`list-anything-btn${wantAnything ? ' active' : ''}`}
              onClick={() => setWantAnything(a => !a)}
              aria-pressed={wantAnything}>
              <span className="list-anything-check" aria-hidden="true">
                {wantAnything
                  ? <CheckIcon />
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                }
              </span>
              Open to anything
            </button>

            <div className={`list-field${wantAnything ? ' list-field-disabled' : ''}`}>
              <label className="list-label" htmlFor="wantTitle">What item do you want?</label>
              <input id="wantTitle" className={`list-input${errors.wantTitle ? ' error' : ''}`}
                type="text" placeholder="e.g. Fujifilm X-T30, iPad Pro, Acoustic Guitar…"
                value={wantTitle} disabled={wantAnything} autoFocus
                onChange={e => { setWantTitle(e.target.value); setErrors(er => ({ ...er, wantTitle: '' })); }} />
              {errors.wantTitle && <p className="list-error" role="alert">{errors.wantTitle}</p>}
            </div>

            <div className={`list-field${wantAnything ? ' list-field-disabled' : ''}`}>
              <label className="list-label" htmlFor="wantCategory">
                Category <span className="list-label-opt">(optional)</span>
              </label>
              <select id="wantCategory" className="list-select" value={wantCategory}
                disabled={wantAnything}
                onChange={e => setWantCategory(e.target.value)}>
                <option value="">Select a category…</option>
                {CATALOG.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {errors.submit && <p className="list-error" role="alert">{errors.submit}</p>}

            <div className="list-step2-actions">
              <button className="list-back-btn" onClick={goBack} disabled={submitting}>
                <BackArrow /> Back
              </button>
              <button className="list-submit-btn" onClick={handleWantsSubmit} disabled={submitting}>
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
