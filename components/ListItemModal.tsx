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
  category:    'List Your Item',
  brand:       'Brand',
  model:       'Model',
  specs:       'Item Specs',
  details:     'Photos & Info',
  wants_cat:   'What Do You Want?',
  wants_brand: 'Brand',
  wants_model: 'Model',
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
  /* ── item state ── */
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

  const [description, setDescription] = useState('');
  const [dragOver, setDragOver]       = useState(false);

  /* ── wants state ── */
  const [wantAnything, setWantAnything]         = useState(false);
  const [wantCatSlug, setWantCatSlug]           = useState('');
  const [wantBrand, setWantBrand]               = useState('');
  const [wantModel, setWantModel]               = useState('');
  const [wantModelSearch, setWantModelSearch]   = useState('');
  const [wantGameName, setWantGameName]         = useState('');

  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── derived ── */
  const cat: CategoryConfig | undefined     = CATALOG.find(c => c.slug === selectedCatSlug);
  const wantCat: CategoryConfig | undefined = CATALOG.find(c => c.slug === wantCatSlug);

  const allSteps = useMemo<string[]>(() => {
    const s: string[] = ['category'];
    if (cat) {
      if (cat.brands || cat.types) s.push('brand');
      if (cat.brands) s.push('model');
      if (cat.specs.length > 0) s.push('specs');
    }
    s.push('details');
    if (!skipWantStep) {
      s.push('wants_cat');
      if (!wantAnything && wantCatSlug) {
        if (wantCat?.brands || wantCat?.types) s.push('wants_brand');
        if (wantCat?.brands && wantBrand)       s.push('wants_model');
      }
    }
    return s;
  }, [cat, skipWantStep, wantAnything, wantCatSlug, wantCat, wantBrand]);

  const stepIndex = allSteps.indexOf(currentStep);

  const brandModels      = cat?.brands?.find(b => b.name === selectedBrand)?.models ?? [];
  const filteredModels   = modelSearch
    ? brandModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()))
    : brandModels;

  const wantBrandModels   = wantCat?.brands?.find(b => b.name === wantBrand)?.models ?? [];
  const filteredWantModels = wantModelSearch
    ? wantBrandModels.filter(m => m.toLowerCase().includes(wantModelSearch.toLowerCase()))
    : wantBrandModels;

  /* ── reset ── */
  function reset() {
    setCurrentStep('category');
    setSelectedCatSlug(''); setSelectedBrand(''); setSelectedModel('');
    setSpecs({}); setModelSearch('');
    setImages([]); previews.forEach(URL.revokeObjectURL); setPreviews([]);
    setTitle(''); setCondition(''); setDescription('');
    setDragOver(false);
    setWantAnything(false); setWantCatSlug(''); setWantBrand('');
    setWantModel(''); setWantModelSearch('');
    setErrors({}); setSubmitting(false);
  }

  function handleClose() { onClose(); setTimeout(reset, 300); }

  /* ── item navigation ── */
  function handleCategorySelect(slug: string) {
    const newCat = CATALOG.find(c => c.slug === slug);
    setSelectedCatSlug(slug); setSelectedBrand(''); setSelectedModel('');
    setSpecs({}); setTitle('');
    if (newCat?.brands || newCat?.types) { setCurrentStep('brand'); return; }
    if (newCat && newCat.specs.length > 0) { setCurrentStep('specs'); return; }
    setCurrentStep('details');
  }

  function handleBrandSelect(brand: string) {
    setSelectedBrand(brand); setSelectedModel(''); setModelSearch('');
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

  /* ── wants navigation ── */
  function handleWantCatSelect(slug: string) {
    const newCat = CATALOG.find(c => c.slug === slug);
    setWantCatSlug(slug); setWantBrand(''); setWantModel(''); setWantModelSearch('');
    if (newCat?.brands || newCat?.types) setCurrentStep('wants_brand');
    // else stay on wants_cat — "List Item" button appears below grid
  }

  function handleWantBrandSelect(brand: string) {
    setWantBrand(brand); setWantModel(''); setWantModelSearch(''); setWantGameName('');
    if (wantCat?.brands) {
      setCurrentStep('wants_model');
    }
    // type-based: stay on wants_brand — "List Item" button appears
  }

  function handleWantModelToggle(model: string) {
    setWantModel(prev => prev === model ? '' : model);
  }

  /* ── go back ── */
  function goBack() {
    const prev = allSteps[stepIndex - 1];
    if (!prev) return;
    setErrors({});
    if (currentStep === 'wants_brand') { setWantBrand(''); setWantModel(''); }
    if (currentStep === 'wants_model') { setWantModel(''); }
    setCurrentStep(prev);
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
    if (images.length === 0) errs.image = 'At least one photo is required';
    if (!title.trim()) errs.title     = 'Title is required';
    if (!condition)    errs.condition = 'Condition is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (skipWantStep) { submitListing(); } else { setCurrentStep('wants_cat'); }
  }

  async function submitListing(overrideAnything?: boolean) {
    setSubmitting(true);
    setErrors({});
    try {
      const s = Session.get();
      const finalAnything = overrideAnything ?? wantAnything;

      const computedWantTitle = finalAnything ? ''
        : wantBrand === 'Video Games' && wantGameName && wantModel ? `${wantGameName} (${wantModel})`
        : wantBrand === 'Video Games' && wantGameName              ? `Video Games - ${wantGameName}`
        : wantModel  ? `${wantBrand} ${wantModel}`
        : wantBrand  ? wantBrand
        : wantCat?.name || '';
      const computedWantCat = finalAnything ? '' : (wantCat?.name || '');

      const fd = new FormData();
      fd.append('title',        title);
      fd.append('category',     cat?.name || 'Other');
      fd.append('brand',        selectedBrand || '');
      fd.append('model',        selectedModel || '');
      fd.append('specs',        JSON.stringify(specs));
      fd.append('condition',    condition || 'good');
      fd.append('price',        '0');
      fd.append('userId',       s?.userId || 'anonymous');
      fd.append('seller',       s?.displayName || 'Anonymous');
      fd.append('wantTitle',    computedWantTitle);
      fd.append('wantCategory', computedWantCat);
      fd.append('wantAnything', finalAnything ? 'true' : 'false');
      fd.append('description', description);
      images.forEach(img => fd.append('image', img));

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

  /* ── shared UI pieces ── */
  const ListItemBtn = ({ disabled }: { disabled?: boolean }) => (
    <button className="list-submit-btn" onClick={() => submitListing()} disabled={disabled ?? submitting}
      style={{ marginTop: 8 }}>
      {submitting ? 'Saving…' : 'List Item'}
      {!submitting && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );

  return (
    <div
      className={`list-modal-overlay${open ? ' open' : ''}`}
      role="dialog" aria-modal="true"
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

        {/* Step dots */}
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
                <button key={c.slug}
                  className={`list-cat-item${selectedCatSlug === c.slug ? ' selected' : ''}`}
                  onClick={() => handleCategorySelect(c.slug)}>
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
            <p className="list-step-hint">{cat?.brands ? 'Select a brand' : 'Select a type'}</p>
            <div className="list-brand-grid">
              {(cat?.brands?.map(b => b.name) ?? cat?.types ?? []).map(name => (
                <button key={name}
                  className={`list-brand-card${selectedBrand === name ? ' selected' : ''}`}
                  onClick={() => handleBrandSelect(name)}>
                  <span>{name}</span>
                  {selectedBrand === name && <span className="list-brand-check"><CheckIcon /></span>}
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
              <input className="list-model-search" placeholder="Search models…"
                value={modelSearch} onChange={e => setModelSearch(e.target.value)} autoFocus />
            )}
            <div className="list-model-list">
              {filteredModels.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                  No models match your search
                </p>
              )}
              {filteredModels.map(model => (
                <button key={model}
                  className={`list-model-item${selectedModel === model ? ' selected' : ''}`}
                  onClick={() => handleModelSelect(model)}>
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
                {selectedModel && <><span className="list-summary-sep">›</span><span>{selectedModel}</span></>}
              </div>
            )}
            {cat?.specs.filter(field => !field.brands || field.brands.includes(selectedBrand)).map(field => (
              <div key={field.key} className="list-field">
                <label className="list-label">
                  {field.label}
                  {!field.required && <span className="list-label-opt"> (optional)</span>}
                </label>
                {field.type === 'select' ? (
                  <select className={`list-select${errors[field.key] ? ' error' : ''}`} value={specs[field.key] || ''}
                    onChange={e => { setSpecs(s => ({ ...s, [field.key]: e.target.value })); setErrors(er => ({ ...er, [field.key]: '' })); }}>
                    <option value="">Select…</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input className={`list-input${errors[field.key] ? ' error' : ''}`} type="text" placeholder={field.placeholder || ''}
                    value={specs[field.key] || ''}
                    onChange={e => { setSpecs(s => ({ ...s, [field.key]: e.target.value })); setErrors(er => ({ ...er, [field.key]: '' })); }} />
                )}
                {errors[field.key] && <p className="list-error" role="alert">{errors[field.key]}</p>}
              </div>
            ))}
            <button className="list-continue-btn" onClick={() => {
              const requiredFields = cat?.specs.filter(
                f => f.required && (!f.brands || f.brands.includes(selectedBrand))
              ) ?? [];
              const missing = requiredFields.filter(f => !specs[f.key]?.trim());
              if (missing.length > 0) {
                setErrors(Object.fromEntries(missing.map(f => [f.key, `${f.label} is required`])));
                return;
              }
              setErrors({});
              setCurrentStep('details');
            }}>
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
            <div
              className={`list-upload-area${dragOver ? ' drag-over' : ''}${previews.length > 0 ? ' has-images' : ''}${errors.image ? ' error' : ''}`}
              onClick={() => previews.length === 0 && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}>
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
            {errors.image && <p className="list-error" role="alert">{errors.image}</p>}

            <div className="list-field">
              <label className="list-label" htmlFor="listTitle">Title</label>
              <input id="listTitle" className={`list-input${errors.title ? ' error' : ''}`}
                type="text" placeholder="e.g. Apple MacBook Pro 14&quot; M4" value={title}
                onChange={e => { setTitle(e.target.value); setErrors(er => ({ ...er, title: '' })); }} />
              {errors.title && <p className="list-error" role="alert">{errors.title}</p>}
            </div>

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


            <div className="list-field">
              <label className="list-label" htmlFor="listDesc">
                Description <span className="list-label-opt">(optional)</span>
              </label>
              <textarea id="listDesc" className="list-textarea"
                placeholder="Describe the condition, age, what's included…"
                rows={3} value={description} onChange={e => setDescription(e.target.value)} />
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

        {/* ── STEP: wants — category ── */}
        {currentStep === 'wants_cat' && (
          <div className="list-modal-body">
            <p className="list-step2-intro">
              What would you like in return? We&apos;ll notify you when a match is found.
            </p>

            {/* Open to anything */}
            <button type="button"
              className={`list-anything-btn${wantAnything ? ' active' : ''}`}
              onClick={() => { setWantAnything(true); submitListing(true); }}
              aria-pressed={wantAnything}>
              <span className="list-anything-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </span>
              Open to anything
            </button>

            <p className="list-step-hint" style={{ marginTop: 4 }}>Or pick a category:</p>

            <div className="list-cat-grid">
              {CATALOG.map(c => (
                <button key={c.slug}
                  className={`list-cat-item${wantCatSlug === c.slug ? ' selected' : ''}`}
                  onClick={() => handleWantCatSelect(c.slug)}>
                  <span className="list-cat-emoji">{c.emoji}</span>
                  <span className="list-cat-name">{c.name}</span>
                </button>
              ))}
            </div>

            {/* Show List Item only for categories with no brand/type sub-step */}
            {wantCatSlug && !wantCat?.brands && !wantCat?.types && (
              <>
                {errors.submit && <p className="list-error" role="alert">{errors.submit}</p>}
                <ListItemBtn />
              </>
            )}
          </div>
        )}

        {/* ── STEP: wants — brand / type ── */}
        {currentStep === 'wants_brand' && (
          <div className="list-modal-body">
            <div className="list-selected-summary">
              <span>{wantCat?.emoji} {wantCat?.name}</span>
            </div>
            <p className="list-step-hint">
              {wantCat?.brands ? 'Select a brand' : 'Select a type'}
            </p>
            <div className="list-brand-grid">
              {(wantCat?.brands?.map(b => b.name) ?? wantCat?.types ?? []).map(name => (
                <button key={name}
                  className={`list-brand-card${wantBrand === name ? ' selected' : ''}`}
                  onClick={() => handleWantBrandSelect(name)}>
                  <span>{name}</span>
                  {wantBrand === name && <span className="list-brand-check"><CheckIcon /></span>}
                </button>
              ))}
            </div>
            {/* For type-based categories, show List Item after selecting a type */}
            {wantBrand && !wantCat?.brands && (
              <>
                {errors.submit && <p className="list-error" role="alert">{errors.submit}</p>}
                <ListItemBtn />
              </>
            )}
          </div>
        )}

        {/* ── STEP: wants — model ── */}
        {currentStep === 'wants_model' && (
          <div className="list-modal-body">
            <div className="list-selected-summary">
              <span>{wantCat?.emoji} {wantCat?.name}</span>
              <span className="list-summary-sep">›</span>
              <span>{wantBrand}</span>
            </div>
            <p className="list-step-hint">Select a model <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(optional)</span></p>
            {wantBrandModels.length > 6 && (
              <input className="list-model-search" placeholder="Search models…"
                value={wantModelSearch} onChange={e => setWantModelSearch(e.target.value)} autoFocus />
            )}
            <div className="list-model-list">
              {filteredWantModels.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                  No models match your search
                </p>
              )}
              {filteredWantModels.map(model => (
                <button key={model}
                  className={`list-model-item${wantModel === model ? ' selected' : ''}`}
                  onClick={() => handleWantModelToggle(model)}>
                  <span>{model}</span>
                  {wantModel === model ? <CheckIcon /> : <ChevronRight />}
                </button>
              ))}
            </div>
            {wantBrand === 'Video Games' && wantModel && (
              <div className="list-field" style={{ marginTop: 16 }}>
                <label className="list-label">
                  Which game?<span className="list-label-opt"> (optional)</span>
                </label>
                <input
                  className="list-input"
                  type="text"
                  placeholder="e.g. Elden Ring, FIFA 25, Spider-Man 2"
                  value={wantGameName}
                  onChange={e => setWantGameName(e.target.value)}
                  autoFocus
                />
              </div>
            )}
            {errors.submit && <p className="list-error" role="alert">{errors.submit}</p>}
            <ListItemBtn />
          </div>
        )}

      </div>
    </div>
  );
}
