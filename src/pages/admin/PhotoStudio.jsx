import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Check, CloudUpload, Filter, FolderOpen, Image,
  ImagePlus, LayoutGrid, ListFilter, Pencil, Plus, Search, Star, Trash2, Upload, X,
} from 'lucide-react'
import { PORTFOLIO_CATEGORIES } from '../../services/portfolioService'
import { addPhotos, deletePhoto, updatePhoto } from '../../services/photoStorageService'
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary'

const CATEGORIES = PORTFOLIO_CATEGORIES
const fieldClass = 'mt-1.5 min-h-11 w-full border border-[#E5DED2] bg-white px-3 py-2 text-sm text-char'
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 border border-[#D9CDBB] px-3 py-2 text-[10px] uppercase tracking-[.12em] text-char transition hover:border-[#B49668]'
const primaryButtonClass = 'inline-flex min-h-11 items-center justify-center gap-2 bg-char px-5 text-[10px] uppercase tracking-[.15em] text-ivory transition hover:bg-dark'

function PageIntro({ eyebrow, title, description, action }) {
  return <div className="mb-7 flex flex-col justify-between gap-5 border-b border-[#E5DED2] pb-6 sm:flex-row sm:items-end">
    <div><p className="mb-2 text-[9px] uppercase tracking-[.24em] text-[#947346]">{eyebrow}</p><h1 className="font-serif text-3xl leading-tight text-char sm:text-[2.6rem]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p></div>
    {action}
  </div>
}

function Feedback({ children, error = false }) {
  return <p role={error ? 'alert' : 'status'} className={`mb-5 border px-4 py-3 text-sm ${error ? 'border-red-800/25 bg-red-50 text-red-900' : 'border-[#DCE5D9] bg-[#F5F8F3] text-[#405D45]'}`}>{children}</p>
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return <article className="border border-[#E5DED2] bg-white/75 p-4 sm:p-5">
    <span className="grid h-10 w-10 place-items-center bg-[#F1EBDD] text-[#947346]"><Icon aria-hidden="true" size={18} strokeWidth={1.6} /></span>
    <p className="mt-5 font-serif text-3xl text-char">{value}</p>
    <p className="mt-1 text-[10px] uppercase tracking-[.15em] text-muted">{label}</p>
    <p className="mt-3 text-xs text-muted">{detail}</p>
  </article>
}

function StatusPill({ published }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[.12em] ${published ? 'bg-[#E8EFE7] text-[#405D45]' : 'bg-[#F1E8D8] text-[#76592D]'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-[#66856A]' : 'bg-gold'}`} />
    {published ? 'Published' : 'Draft'}
  </span>
}

function PhotoCard({ photo, onEdit, onDelete }) {
  return <article className="group overflow-hidden border border-[#E5DED2] bg-white transition hover:border-[#CBB991]">
    <div className="relative aspect-[4/3] overflow-hidden bg-[#E9E3D9]">
      {photo.src ? <img src={photo.src} alt={`${photo.title}: ${photo.description}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
        : <div className="grid h-full place-items-center text-muted"><Image aria-hidden="true" size={28} />{photo.imageMissing && <span className="sr-only">Saved image is unavailable</span>}</div>}
      {photo.featured && <span className="absolute right-3 top-3 inline-flex items-center gap-1 bg-rich/75 px-2.5 py-1.5 text-[9px] uppercase tracking-[.12em] text-white"><Star size={11} className="fill-[#D6B579] text-[#D6B579]" />Featured</span>}
    </div>
    <div className="p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-serif text-lg text-char">{photo.title}</h2><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-muted">{photo.category}</p></div></div>
      <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-5 text-muted">{photo.description}</p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEE9E0] pt-3"><StatusPill published={photo.published} /><div className="flex gap-1">
        <button type="button" onClick={() => onEdit(photo)} aria-label={`Edit ${photo.title}`} className="grid h-9 w-9 place-items-center text-muted hover:bg-[#F1EBDD] hover:text-char"><Pencil size={15} /></button>
        <button type="button" onClick={() => onDelete(photo)} aria-label={`Delete ${photo.title}`} className="grid h-9 w-9 place-items-center text-muted hover:bg-red-50 hover:text-red-800"><Trash2 size={15} /></button>
      </div></div>
    </div>
  </article>
}

function PhotoDialog({ photo, onClose, onSave }) {
  const dialogRef = useRef(null)
  const [title, setTitle] = useState(photo?.title || '')
  const [description, setDescription] = useState(photo?.description || '')
  const [category, setCategory] = useState(photo?.category || CATEGORIES[0])
  const [featured, setFeatured] = useState(photo?.featured || false)
  const [published, setPublished] = useState(photo?.published ?? true)
  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState('')
  const [operationError, setOperationError] = useState('')
  const [saving, setSaving] = useState(false)
  const [previews, setPreviews] = useState([])
  const isEditing = Boolean(photo)

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    dialog.showModal()
    return () => { if (dialog.open) dialog.close() }
  }, [])

  function chooseFiles(event) {
    const selectedFiles = Array.from(event.target.files || [])
    event.target.value = ''
    if (!selectedFiles.length) return
    const invalid = selectedFiles.find((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      || file.size > 10 * 1024 * 1024)
    if (invalid) {
      setFileError(`${invalid.name}: choose a JPEG, PNG, or WebP image under 10 MB.`)
      return
    }
    setFiles(isEditing ? selectedFiles.slice(0, 1) : selectedFiles)
    setFileError('')
    setOperationError('')
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setOperationError('')
    try {
      if (isEditing) {
        await onSave({ id: photo.id, title, description, category, featured, published, file: files[0] })
      } else {
        const entries = files.map((file, index) => ({
          file,
          title: files.length > 1 ? `${title.trim()} ${index + 1}` : title,
          description,
          category,
          featured,
          published,
        }))
        await onSave(entries)
      }
      onClose()
    } catch (saveError) {
      setOperationError(saveError.message || 'The photo could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const shownImages = isEditing
    ? [{ src: photo.src, label: 'Current image' }, ...previews.map((src) => ({ src, label: 'Replacement preview' }))]
    : previews.map((src) => ({ src, label: 'Selected image' }))
  return <dialog ref={dialogRef} aria-labelledby="photo-dialog-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose() }}
    onClick={(event) => { if (event.target === dialogRef.current && !saving) onClose() }}
    className="m-auto max-h-[94dvh] w-[min(96vw,900px)] overflow-y-auto border border-[#DED4C4] bg-[#FAF8F3] p-0 text-char shadow-2xl backdrop:bg-rich/65">
    <div className="flex items-start justify-between gap-4 border-b border-[#E5DED2] px-5 py-4 sm:px-7">
      <div><p className="text-[9px] uppercase tracking-[.2em] text-[#947346]">Photo library</p><h2 id="photo-dialog-title" className="mt-1 font-serif text-2xl">{isEditing ? 'Edit photo' : 'Add new photo'}</h2></div>
      <button type="button" disabled={saving} onClick={onClose} aria-label="Close photo form" className="grid h-10 w-10 place-items-center border border-[#E5DED2] hover:border-[#B49668] disabled:opacity-50"><X size={17} /></button>
    </div>
    <form onSubmit={submit} className="grid md:grid-cols-[.9fr_1.1fr]">
      <div className="border-b border-[#E5DED2] bg-[#F1EBDD] p-4 md:border-b-0 md:border-r sm:p-6">
        {shownImages.length ? <div className={`grid gap-3 ${shownImages.length > 1 ? 'grid-cols-2' : ''}`}>
          {shownImages.filter((image) => image.src).map(({ src, label }, index) => <div key={`${src}-${index}`} className="relative overflow-hidden bg-[#E9E3D9]"><img src={src} alt={`${label}${files[index - 1]?.name ? `: ${files[index - 1].name}` : ''}`} className="aspect-[4/3] w-full object-cover" /><span className="absolute bottom-2 left-2 bg-rich/75 px-2 py-1 text-[9px] uppercase tracking-wider text-white">{label}</span></div>)}
        </div> : <div className="grid min-h-56 place-items-center border border-dashed border-[#BCA782] bg-white/65 px-5 text-center">
          <div><ImagePlus aria-hidden="true" size={28} className="mx-auto text-[#987A4D]" /><p className="mt-3 font-serif text-lg">{isEditing ? 'Current photo' : 'Choose images to preview'}</p><p className="mt-1 text-xs text-muted">JPEG, PNG, or WebP · up to 10 MB each</p></div>
        </div>}
        <label className={`${buttonClass} mt-4 w-full cursor-pointer justify-center`}><CloudUpload size={14} />{files.length ? 'Choose different image(s)' : isEditing ? 'Replace photo' : 'Choose photo(s)'}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple={!isEditing} onChange={chooseFiles} className="sr-only" />
        </label>
        {files.length > 0 && <p className="mt-2 text-xs text-muted">{files.length} image{files.length === 1 ? '' : 's'} selected{files.length > 1 ? ` · titles will be numbered “${title || 'Photo'} 1–${files.length}”` : ''}</p>}
        {fileError && <p role="alert" className="mt-2 text-xs text-red-800">{fileError}</p>}
      </div>
      <div className="p-5 sm:p-7">
        {operationError && <p role="alert" className="mb-4 border border-red-800/25 bg-red-50 px-3 py-2 text-xs text-red-900">{operationError}</p>}
        <label className="block text-[10px] uppercase tracking-[.14em] text-muted">Photo title
          <input autoFocus required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} placeholder="A memorable moment" />
        </label>
        <label className="mt-4 block text-[10px] uppercase tracking-[.14em] text-muted">Description
          <textarea required rows="4" maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} className={`${fieldClass} resize-y`} placeholder="Share a little about this photograph." />
        </label>
        <label className="mt-4 block text-[10px] uppercase tracking-[.14em] text-muted">Category
          <select required value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <div className="mt-5 space-y-3 border-y border-[#E5DED2] py-4">
          <label className="flex min-h-8 items-center gap-3 text-sm text-char"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="h-4 w-4 accent-[#C6A16A]" /><Star size={14} className="text-[#947346]" />Featured photo</label>
          <label className="flex min-h-8 items-center gap-3 text-sm text-char"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="h-4 w-4 accent-[#C6A16A]" /><Check size={14} className="text-[#55705A]" />Published in public portfolio</label>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" disabled={saving} onClick={onClose} className={buttonClass}>Cancel</button>
          <button type="submit" disabled={saving || Boolean(fileError) || (!isEditing && !files.length)} className={`${primaryButtonClass} disabled:cursor-wait disabled:opacity-60`}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : `Save${files.length > 1 ? ` ${files.length} photos` : ' photo'}`}
          </button>
        </div>
      </div>
    </form>
  </dialog>
}

function DeleteDialog({ photo, onClose, onConfirm }) {
  const dialogRef = useRef(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    dialog.showModal()
    return () => { if (dialog.open) dialog.close() }
  }, [])
  async function confirm() {
    setDeleting(true)
    setError('')
    try {
      await onConfirm(photo)
      onClose()
    } catch (deleteError) {
      setError(deleteError.message || 'The photo could not be deleted.')
      setDeleting(false)
    }
  }
  return <dialog ref={dialogRef} aria-labelledby="delete-photo-title" onCancel={(event) => { event.preventDefault(); if (!deleting) onClose() }}
    className="m-auto w-[min(92vw,430px)] border border-[#DED4C4] bg-[#FAF8F3] p-6 text-char shadow-2xl backdrop:bg-rich/65 sm:p-7">
    <p className="text-[9px] uppercase tracking-[.18em] text-[#947346]">Confirm deletion</p>
    <h2 id="delete-photo-title" className="mt-2 font-serif text-2xl">Delete this photo?</h2>
    <p className="mt-2 text-sm leading-6 text-muted">“{photo.title}” will be removed from this browser’s photo library and public portfolio. This cannot be undone.</p>
    {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
    <div className="mt-6 flex justify-end gap-2">
      <button type="button" disabled={deleting} onClick={onClose} className={buttonClass}>Cancel</button>
      <button type="button" disabled={deleting} onClick={confirm} className="inline-flex min-h-10 items-center gap-2 bg-[#8D5148] px-4 text-[10px] uppercase tracking-[.12em] text-white disabled:opacity-60">{deleting ? 'Deleting…' : 'Delete photo'}</button>
    </div>
  </dialog>
}

function Summary({ photos }) {
  const featured = photos.filter((photo) => photo.featured).length
  const categories = new Set(photos.map((photo) => photo.category)).size
  return <section aria-label="Photo library summary" className="mb-8 grid gap-3 sm:grid-cols-3">
    <MetricCard label="Total photos" value={photos.length} detail="Across your studio library" icon={Image} />
    <MetricCard label="Featured photos" value={featured} detail="Selected highlights from your work" icon={Star} />
    <MetricCard label="Photo categories" value={categories} detail="Categories represented in your library" icon={LayoutGrid} />
  </section>
}

function PhotoGallery({ photos, loading, error, onRetry }) {
  const { adminSearch, setAdminSearch } = useOutletContext()
  const [category, setCategory] = useState('All categories')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [adding, setAdding] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const editorTrigger = useRef(null)
  const deleteTrigger = useRef(null)
  const filteredPhotos = useMemo(() => photos.filter((photo) => (
    (category === 'All categories' || photo.category === category)
    && (!adminSearch.trim() || photo.title.toLowerCase().includes(adminSearch.trim().toLowerCase()))
  )), [photos, category, adminSearch])

  async function saveNew(entries) {
    await addPhotos(entries)
    setFeedback(`${entries.length} photo${entries.length === 1 ? '' : 's'} added to your library.`)
    setActionError('')
  }
  async function saveChanges(updated) {
    await updatePhoto(updated)
    setFeedback('Photo changes saved.')
    setActionError('')
  }
  async function remove(photo) {
    await deletePhoto(photo.id)
    setFeedback(`“${photo.title}” was deleted.`)
    setActionError('')
  }

  return <div>
    <PageIntro eyebrow="Your visual library" title="Photo gallery" description="Browse, organize, and review the photographs in your studio library."
      action={<button type="button" onClick={() => { setAdding(true); setFeedback('') }} className={primaryButtonClass}><Plus size={15} />Add new photo</button>} />
    {feedback && <Feedback>{feedback}</Feedback>}
    {actionError && <Feedback error>{actionError}</Feedback>}
    {error && <Feedback error>{error}<button type="button" onClick={onRetry} className="ml-2 underline underline-offset-2">Try again</button></Feedback>}
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-sm"><Search aria-hidden="true" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input aria-label="Search photos by title" value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search by photo title…" className="min-h-11 w-full border border-[#E5DED2] bg-white/70 pl-9 pr-3 text-sm text-char placeholder:text-muted/70 focus:border-[#B49668]" /></div>
      <label className="relative"><span className="sr-only">Filter by category</span><Filter aria-hidden="true" size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 w-full appearance-none border border-[#E5DED2] bg-white/70 pl-9 pr-8 text-xs text-char sm:w-56"><option>All categories</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
    <div className="mb-4 flex items-center justify-between border-y border-[#E5DED2] py-3 text-xs text-muted"><span>{loading ? 'Loading photos…' : `${filteredPhotos.length} ${filteredPhotos.length === 1 ? 'photo' : 'photos'}`}</span>{category !== 'All categories' && <button type="button" onClick={() => setCategory('All categories')} className="underline underline-offset-2">Clear category filter</button>}</div>
    {loading ? <p role="status" className="py-16 text-center text-sm text-muted">Loading your photo library…</p>
      : filteredPhotos.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filteredPhotos.map((photo) => <PhotoCard key={photo.id} photo={photo}
        onEdit={(item) => { editorTrigger.current = document.activeElement; setEditing(item); setFeedback('') }}
        onDelete={(item) => { deleteTrigger.current = document.activeElement; setDeleting(item); setFeedback('') }} />)}</div>
        : <div className="border border-dashed border-[#D9CDBB] bg-white/40 px-5 py-16 text-center">
          <Image aria-hidden="true" size={27} className="mx-auto text-[#A38A64]" />
          <h2 className="mt-4 font-serif text-2xl">{photos.length ? 'No photographs found' : 'Your photo gallery is ready'}</h2>
          <p className="mt-2 text-sm text-muted">{photos.length ? 'Try another title or category filter.' : 'Add your first image to start building the portfolio.'}</p>
          {!photos.length && <button type="button" onClick={() => setAdding(true)} className={`${primaryButtonClass} mt-5`}><Plus size={14} />Add new photo</button>}
        </div>}
    {adding && <PhotoDialog onClose={() => setAdding(false)} onSave={saveNew} />}
    {editing && <PhotoDialog photo={editing} onClose={() => { setEditing(null); editorTrigger.current?.focus() }} onSave={saveChanges} />}
    {deleting && <DeleteDialog photo={deleting} onClose={() => { setDeleting(null); deleteTrigger.current?.focus() }} onConfirm={remove} />}
  </div>
}

function Overview({ photos, loading, error }) {
  const featured = photos.find((photo) => photo.featured && photo.src) || photos.find((photo) => photo.src)
  const recent = photos.slice(-4).reverse()
  return <div>
    <PageIntro eyebrow="Your studio library" title="Good morning, Sami." description="A considered look at the photographs and visual stories in your collection."
      action={<Link to="/admin/upload" className={primaryButtonClass}><Upload size={14} />Upload photos</Link>} />
    {error && <Feedback error>{error}</Feedback>}
    <Summary photos={photos} />
    {loading ? <p role="status" className="py-10 text-center text-sm text-muted">Loading your photo library…</p> : <>
      <section className="mb-8 grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
        <div className="relative min-h-[250px] overflow-hidden bg-char sm:min-h-[310px]">
          {featured?.src && <img src={featured.src} alt={`${featured.title}: ${featured.description}`} className="absolute inset-0 h-full w-full object-cover opacity-70" />}
          <div className="absolute inset-0 bg-gradient-to-r from-rich/80 via-rich/30 to-transparent" />
          <div className="relative flex min-h-[250px] max-w-xl flex-col items-start justify-end p-6 text-ivory sm:min-h-[310px] sm:p-9">
            <span className="mb-3 inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[9px] uppercase tracking-[.18em]"><Star size={11} className="fill-[#D6B579] text-[#D6B579]" />{featured ? 'Featured photograph' : 'Photo library'}</span>
            <h2 className="font-serif text-3xl sm:text-4xl">{featured?.title || 'A collection in the making.'}</h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-white/75">{featured?.description || 'Add photographs to start shaping your visual portfolio.'}</p>
            <Link to="/admin/photos" className="mt-5 inline-flex min-h-10 items-center gap-2 border border-white/45 px-4 text-[9px] uppercase tracking-[.14em] transition hover:border-white">Explore photo gallery<ArrowRight size={13} /></Link>
          </div>
        </div>
        <div className="border border-[#E5DED2] bg-white/65 p-5 sm:p-6">
          <p className="text-[9px] uppercase tracking-[.18em] text-[#947346]">Library snapshot</p><h2 className="mt-1 font-serif text-2xl">Collection health</h2>
          <div className="mt-7 space-y-5">
            {[['Photos with descriptions', photos.filter((photo) => photo.description.trim()).length], ['Featured selection', photos.filter((photo) => photo.featured).length], ['Published in portfolio', photos.filter((photo) => photo.published).length]].map(([label, count]) => {
              const progress = photos.length ? Math.round((count / photos.length) * 100) : 0
              return <div key={label}><div className="mb-2 flex justify-between gap-2 text-xs"><span className="text-char">{label}</span><span className="text-muted">{count} of {photos.length}</span></div><div className="h-1.5 bg-[#EEE9E0]"><div className="h-full bg-[#BA9A68]" style={{ width: `${progress}%` }} /></div></div>
            })}
          </div>
          <p className="mt-7 border-t border-[#E5DED2] pt-4 text-xs leading-5 text-muted">Photo details are saved in this browser. They are not shared across devices.</p>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#947346]">Recently added</p><h2 className="mt-1 font-serif text-2xl">A few from the collection</h2></div><Link to="/admin/photos" className="inline-flex min-h-10 items-center gap-1 text-[9px] uppercase tracking-[.14em] text-muted hover:text-char">View all photos<ArrowRight size={13} /></Link></div>
        {recent.length ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{recent.map((photo) => <Link key={photo.id} to="/admin/photos" className="group overflow-hidden border border-[#E5DED2] bg-white/70">
          <div className="aspect-[4/3] overflow-hidden bg-[#E9E3D9]">{photo.src && <img src={photo.src} alt={photo.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />}</div>
          <div className="flex items-center justify-between gap-2 p-3"><span className="truncate font-serif text-sm">{photo.title}</span><ArrowUpRight size={14} className="shrink-0 text-muted" /></div>
        </Link>)}</div> : <p className="border border-dashed border-[#D9CDBB] p-8 text-center text-sm text-muted">No photos yet.</p>}
      </section>
    </>}
  </div>
}

function UploadPhotos({ onAdd }) {
  const [adding, setAdding] = useState(false)
  const [feedback, setFeedback] = useState('')
  return <div>
    <PageIntro eyebrow="Grow your visual library" title="Upload photos" description="Select one or more images, preview them, and add them to your portfolio."
      action={<Link to="/admin/photos" className={`${buttonClass} border-0`}><ArrowRight size={14} className="rotate-180" />Back to gallery</Link>} />
    {feedback && <Feedback>{feedback}</Feedback>}
    <section className="border border-[#E5DED2] bg-white/70 p-5 sm:p-8">
      <div className="mx-auto grid min-h-72 max-w-2xl place-items-center border border-dashed border-[#BCA782] bg-[#F7F4ED] px-5 py-9 text-center">
        <div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#D8CBB3] bg-white text-[#987A4D]"><CloudUpload aria-hidden="true" size={24} strokeWidth={1.5} /></span><h2 className="mt-5 font-serif text-2xl">Bring your work in</h2><p className="mt-2 text-sm text-muted">Choose JPEG, PNG, or WebP images up to 10 MB each.</p>
          <button type="button" onClick={() => setAdding(true)} className={`${primaryButtonClass} mt-5`}><Upload size={14} />Choose photos</button>
          <p className="mt-4 text-xs text-muted">Images are saved in IndexedDB; photo details are kept in localStorage.</p>
        </div>
      </div>
    </section>
    {adding && <PhotoDialog onClose={() => setAdding(false)} onSave={async (photos) => { await onAdd(photos); setFeedback(`${photos.length} photo${photos.length === 1 ? '' : 's'} added to your library.`) }} />}
  </div>
}

function Categories({ photos }) {
  const categories = CATEGORIES.map((name) => ({
    name,
    photos: photos.filter((photo) => photo.category === name),
  }))
  return <div>
    <PageIntro eyebrow="Organize your studio library" title="Categories" description="Browse the collection by the kind of work you create." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{categories.map(({ name, photos: categoryPhotos }) => {
      const cover = categoryPhotos.find((photo) => photo.src)
      return <article key={name} className="flex items-center gap-4 border border-[#E5DED2] bg-white/70 p-3">
        <div className="grid h-20 w-24 shrink-0 place-items-center overflow-hidden bg-[#E9E3D9]">{cover?.src ? <img src={cover.src} alt="" className="h-full w-full object-cover" /> : <FolderOpen aria-hidden="true" size={20} className="text-[#A38A64]" />}</div>
        <div className="min-w-0"><p className="font-serif text-lg">{name}</p><p className="mt-1 text-xs text-muted">{categoryPhotos.length} {categoryPhotos.length === 1 ? 'photo' : 'photos'}</p></div>
      </article>
    })}</div>
  </div>
}

export default function PhotoStudio() {
  const { pathname } = useOutletContext()
  const [retryKey, setRetryKey] = useState(0)
  const { photos, loading, error } = usePhotoLibrary(false, retryKey)

  async function addNewPhotos(entries) {
    await addPhotos(entries)
  }

  if (pathname === '/admin/photos') return <PhotoGallery photos={photos} loading={loading} error={error} onRetry={() => setRetryKey((key) => key + 1)} />
  if (pathname === '/admin/upload') return <UploadPhotos onAdd={addNewPhotos} />
  if (pathname === '/admin/categories') return <Categories photos={photos} />
  return <Overview photos={photos} loading={loading} error={error} />
}
