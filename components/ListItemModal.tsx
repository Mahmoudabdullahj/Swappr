'use client';

import { useState, useRef, useMemo } from 'react';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { Session } from '@/lib/session';
import { CATALOG, CategoryConfig } from '@/lib/item-catalog';
import styles from './ListItemModal.module.css';

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

function CategoryIcon({ slug }: { slug: string }) {
  const p = { viewBox: '0 0 24 24', width: 26, height: 26, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  switch (slug) {
    case 'phones':
      return <svg {...p}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>;
    case 'laptops':
      return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="19" x2="22" y2="19"/><line x1="8" y1="22" x2="16" y2="22"/></svg>;
    case 'tablets':
      return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 17.5h.01"/></svg>;
    case 'gaming':
      return <svg {...p}><path d="M17 5H7a5 5 0 0 0-5 5v5a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5v-5a5 5 0 0 0-5-5Z"/><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><circle cx="15" cy="11" r="1" fill="currentColor" strokeWidth="0"/><circle cx="17" cy="13" r="1" fill="currentColor" strokeWidth="0"/></svg>;
    case 'cameras':
      return <svg {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3L14.5 4z"/><circle cx="12" cy="13" r="3"/></svg>;
    case 'smartwatches':
      return <svg {...p}><circle cx="12" cy="12" r="6"/><path d="M12 10v2l1.5 1.5"/><path d="M9 5V3h6v2"/><path d="M9 19v2h6v-2"/></svg>;
    case 'headphones':
      return <svg {...p}><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>;
    case 'electronics':
      return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="4" x2="9" y2="2"/><line x1="15" y1="4" x2="15" y2="2"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="4" y1="9" x2="2" y2="9"/><line x1="4" y1="14" x2="2" y2="14"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="14" x2="22" y2="14"/></svg>;
    case 'furniture':
      return <svg {...p}><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v9"/></svg>;
    case 'fashion':
      return <svg {...p}><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>;
    case 'sports':
      return <svg {...p}><path d="M6 8v8"/><path d="M4 9.5v5"/><path d="M18 8v8"/><path d="M20 9.5v5"/><line x1="6" y1="12" x2="18" y2="12"/></svg>;
    case 'instruments':
      return <svg {...p}><circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/></svg>;
    case 'books':
      return <svg {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    case 'toys':
      return <svg {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
    case 'cars':
      return <svg {...p}><path d="M5 17H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  }
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

  const dialogRef = useFocusTrap(open, handleClose);

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
      ref={dialogRef}
      className={`${styles['list-modal-overlay']}${open ? ` ${styles.open}` : ''}`}
      role="dialog" aria-modal="true" aria-labelledby="listModalTitle"
    >
      <div className={styles['list-modal']}>

        {/* Header */}
        <div className={styles['list-modal-header']}>
          {currentStep !== 'category' ? (
            <button className={styles['list-back-icon-btn']} onClick={goBack} aria-label="Go back">
              <BackArrow />
            </button>
          ) : (
            <div style={{ width: 32 }} />
          )}
          <h2 className={styles['list-modal-title']} id="listModalTitle" style={{ flex: 1, textAlign: 'center' }}>
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
          <div className={styles['list-step-dots-bar']}>
            {allSteps.map((s, i) => (
              <span
                key={s}
                className={`${styles['list-step-dot']}${i < stepIndex ? ` ${styles.done}` : i === stepIndex ? ` ${styles.active}` : ''}`}
              />
            ))}
          </div>
        )}

        {/* ── STEP: category ── */}
        {currentStep === 'category' && (
          <div className={styles['list-modal-body']}>
            <p className={styles['list-step-hint']}>What are you listing?</p>
            <div className={styles['list-cat-grid']}>
              {CATALOG.map(c => (
                <button key={c.slug}
                  className={`${styles['list-cat-item']}${selectedCatSlug === c.slug ? ` ${styles.selected}` : ''}`}
                  onClick={() => handleCategorySelect(c.slug)}>
                  <CategoryIcon slug={c.slug} />
                  <span className={styles['list-cat-name']}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: brand / type ── */}
        {currentStep === 'brand' && (
          <div className={styles['list-modal-body']}>
            <p className={styles['list-step-hint']}>{cat?.brands ? 'Select a brand' : 'Select a type'}</p>
            <div className={styles['list-brand-grid']}>
              {(cat?.brands?.map(b => b.name) ?? cat?.types ?? []).map(name => (
                <button key={name}
                  className={`${styles['list-brand-card']}${selectedBrand === name ? ` ${styles.selected}` : ''}`}
                  onClick={() => handleBrandSelect(name)}>
                  <span>{name}</span>
                  {selectedBrand === name && <span className={styles['list-brand-check']}><CheckIcon /></span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: model ── */}
        {currentStep === 'model' && (
          <div className={styles['list-modal-body']}>
            <p className={styles['list-step-hint']}>{selectedBrand}</p>
            {brandModels.length > 6 && (
              <input className={styles['list-model-search']} placeholder="Search models…"
                value={modelSearch} onChange={e => setModelSearch(e.target.value)} autoFocus />
            )}
            <div className={styles['list-model-list']}>
              {filteredModels.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                  No models match your search
                </p>
              )}
              {filteredModels.map(model => (
                <button key={model}
                  className={`${styles['list-model-item']}${selectedModel === model ? ` ${styles.selected}` : ''}`}
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
          <div className={styles['list-modal-body']}>
            {(selectedBrand || selectedModel) && (
              <div className={styles['list-selected-summary']}>
                {selectedBrand && <span>{selectedBrand}</span>}
                {selectedModel && <><span className={styles['list-summary-sep']}>›</span><span>{selectedModel}</span></>}
              </div>
            )}
            {cat?.specs.filter(field => !field.brands || field.brands.includes(selectedBrand)).map(field => (
              <div key={field.key} className={styles['list-field']}>
                <label className={styles['list-label']}>
                  {field.label}
                  {!field.required && <span className={styles['list-label-opt']}> (optional)</span>}
                </label>
                {field.type === 'select' ? (
                  <select className={`${styles['list-select']}${errors[field.key] ? ` ${styles.error}` : ''}`} value={specs[field.key] || ''}
                    onChange={e => { setSpecs(s => ({ ...s, [field.key]: e.target.value })); setErrors(er => ({ ...er, [field.key]: '' })); }}>
                    <option value="">Select…</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input className={`${styles['list-input']}${errors[field.key] ? ` ${styles.error}` : ''}`} type="text" placeholder={field.placeholder || ''}
                    value={specs[field.key] || ''}
                    onChange={e => { setSpecs(s => ({ ...s, [field.key]: e.target.value })); setErrors(er => ({ ...er, [field.key]: '' })); }} />
                )}
                {errors[field.key] && <p className={styles['list-error']} role="alert">{errors[field.key]}</p>}
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
          <div className={styles['list-modal-body']}>
            <div
              className={`${styles['list-upload-area']}${dragOver ? ` ${styles['drag-over']}` : ''}${previews.length > 0 ? ` ${styles['has-images']}` : ''}${errors.image ? ` ${styles.error}` : ''}`}
              onClick={() => previews.length === 0 && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
              {previews.length === 0 ? (
                <>
                  <div className={styles['list-upload-icon']} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className={styles['list-upload-label']}>Click or drag photos here</p>
                  <p className={styles['list-upload-sub']}>Up to 5 images · JPG, PNG, WEBP</p>
                </>
              ) : (
                <div className={styles['list-image-previews']} onClick={e => e.stopPropagation()}>
                  {previews.map((src, i) => (
                    <div key={i} className={styles['list-preview-thumb']}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button className={styles['list-preview-remove']} onClick={() => removeImage(i)} aria-label={`Remove image ${i + 1}`}>×</button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button className={styles['list-preview-add']} onClick={() => fileInputRef.current?.click()} aria-label="Add more photos">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
            {errors.image && <p className={styles['list-error']} role="alert">{errors.image}</p>}

            <div className={styles['list-field']}>
              <label className={styles['list-label']} htmlFor="listTitle">Title</label>
              <input id="listTitle" className={`${styles['list-input']}${errors.title ? ` ${styles.error}` : ''}`}
                type="text" placeholder="e.g. Apple MacBook Pro 14&quot; M4" value={title}
                onChange={e => { setTitle(e.target.value); setErrors(er => ({ ...er, title: '' })); }} />
              {errors.title && <p className={styles['list-error']} role="alert">{errors.title}</p>}
            </div>

            <div className={styles['list-field']}>
              <label className={styles['list-label']}>Condition</label>
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
              {errors.condition && <p className={styles['list-error']} role="alert">{errors.condition}</p>}
            </div>


            <div className={styles['list-field']}>
              <label className={styles['list-label']} htmlFor="listDesc">
                Description <span className={styles['list-label-opt']}>(optional)</span>
              </label>
              <textarea id="listDesc" className={styles['list-textarea']}
                placeholder="Describe the condition, age, what's included…"
                rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            {errors.submit && <p className={styles['list-error']} role="alert">{errors.submit}</p>}

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
          <div className={styles['list-modal-body']}>
            <p className={styles['list-step2-intro']}>
              What would you like in return? We&apos;ll notify you when a match is found.
            </p>

            {/* Open to anything */}
            <button type="button"
              className={`${styles['list-anything-btn']}${wantAnything ? ` ${styles.active}` : ''}`}
              onClick={() => { setWantAnything(true); submitListing(true); }}
              aria-pressed={wantAnything}>
              <span className={styles['list-anything-check']} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </span>
              Open to anything
            </button>

            <p className={styles['list-step-hint']} style={{ marginTop: 4 }}>Or pick a category:</p>

            <div className={styles['list-cat-grid']}>
              {CATALOG.map(c => (
                <button key={c.slug}
                  className={`${styles['list-cat-item']}${wantCatSlug === c.slug ? ` ${styles.selected}` : ''}`}
                  onClick={() => handleWantCatSelect(c.slug)}>
                  <CategoryIcon slug={c.slug} />
                  <span className={styles['list-cat-name']}>{c.name}</span>
                </button>
              ))}
            </div>

            {/* Show List Item only for categories with no brand/type sub-step */}
            {wantCatSlug && !wantCat?.brands && !wantCat?.types && (
              <>
                {errors.submit && <p className={styles['list-error']} role="alert">{errors.submit}</p>}
                <ListItemBtn />
              </>
            )}
          </div>
        )}

        {/* ── STEP: wants — brand / type ── */}
        {currentStep === 'wants_brand' && (
          <div className={styles['list-modal-body']}>
            <div className={styles['list-selected-summary']}>
              <span>{wantCat?.emoji} {wantCat?.name}</span>
            </div>
            <p className={styles['list-step-hint']}>
              {wantCat?.brands ? 'Select a brand' : 'Select a type'}
            </p>
            <div className={styles['list-brand-grid']}>
              {(wantCat?.brands?.map(b => b.name) ?? wantCat?.types ?? []).map(name => (
                <button key={name}
                  className={`${styles['list-brand-card']}${wantBrand === name ? ` ${styles.selected}` : ''}`}
                  onClick={() => handleWantBrandSelect(name)}>
                  <span>{name}</span>
                  {wantBrand === name && <span className={styles['list-brand-check']}><CheckIcon /></span>}
                </button>
              ))}
            </div>
            {/* For type-based categories, show List Item after selecting a type */}
            {wantBrand && !wantCat?.brands && (
              <>
                {errors.submit && <p className={styles['list-error']} role="alert">{errors.submit}</p>}
                <ListItemBtn />
              </>
            )}
          </div>
        )}

        {/* ── STEP: wants — model ── */}
        {currentStep === 'wants_model' && (
          <div className={styles['list-modal-body']}>
            <div className={styles['list-selected-summary']}>
              <span>{wantCat?.emoji} {wantCat?.name}</span>
              <span className={styles['list-summary-sep']}>›</span>
              <span>{wantBrand}</span>
            </div>
            <p className={styles['list-step-hint']}>Select a model <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(optional)</span></p>
            {wantBrandModels.length > 6 && (
              <input className={styles['list-model-search']} placeholder="Search models…"
                value={wantModelSearch} onChange={e => setWantModelSearch(e.target.value)} autoFocus />
            )}
            <div className={styles['list-model-list']}>
              {filteredWantModels.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                  No models match your search
                </p>
              )}
              {filteredWantModels.map(model => (
                <button key={model}
                  className={`${styles['list-model-item']}${wantModel === model ? ` ${styles.selected}` : ''}`}
                  onClick={() => handleWantModelToggle(model)}>
                  <span>{model}</span>
                  {wantModel === model ? <CheckIcon /> : <ChevronRight />}
                </button>
              ))}
            </div>
            {wantBrand === 'Video Games' && wantModel && (
              <div className={styles['list-field']} style={{ marginTop: 16 }}>
                <label className={styles['list-label']}>
                  Which game?<span className={styles['list-label-opt']}> (optional)</span>
                </label>
                <input
                  className={styles['list-input']}
                  type="text"
                  placeholder="e.g. Elden Ring, FIFA 25, Spider-Man 2"
                  value={wantGameName}
                  onChange={e => setWantGameName(e.target.value)}
                  autoFocus
                />
              </div>
            )}
            {errors.submit && <p className={styles['list-error']} role="alert">{errors.submit}</p>}
            <ListItemBtn />
          </div>
        )}

      </div>
    </div>
  );
}
