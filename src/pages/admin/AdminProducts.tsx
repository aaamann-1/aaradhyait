import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Edit, Trash2, Package, X, LayoutGrid, List, Upload, FileText, PowerOff } from 'lucide-react'

import {
  getProducts, addProduct, updateProduct,
  deleteProduct, deleteProducts, getProduct, toggleProduct
} from '../../services/admin/productService'
import { getCategories, addCategory } from '../../services/admin/categoriesService'

const CategoryDropdown = ({
  categories, value, onChange, onDelete, onAdd, newCategoryName, setNewCategoryName
}: {
  categories: any[]
  value: any
  onChange: (val: string) => void
  onDelete: (id: number) => void
  onAdd: () => void
  newCategoryName: string
  setNewCategoryName: (v: string) => void
}) => {
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setAdding(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const selectedName = categories.find(c => String(c.cat_id) === String(value))?.name || ''

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setAdding(false) }}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={selectedName ? 'text-gray-800' : 'text-gray-400'}>
          {selectedName || 'Select category'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {categories.map(c => (
            <div
              key={c.cat_id}
              className={`flex items-center border-b border-gray-50 hover:bg-gray-50 transition-colors ${String(value) === String(c.cat_id) ? 'bg-blue-50' : ''}`}
            >
              <button
                type="button"
                onClick={() => { onChange(c.cat_id); setOpen(false) }}
                className={`flex-1 text-left px-4 py-2.5 text-sm ${String(value) === String(c.cat_id) ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
              >
                {c.name}
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onDelete(c.cat_id) }}
                className="pr-3 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <div className="border-t border-gray-100" />

          {adding ? (
            <div className="px-3 py-2.5 bg-blue-50 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onAdd(); setAdding(false); setOpen(false) }
                  if (e.key === 'Escape') { setAdding(false); setNewCategoryName('') }
                }}
                placeholder="Category name..."
                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => { onAdd(); setAdding(false); setOpen(false) }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setNewCategoryName('') }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium"
            >
              <Plus size={14} /> Add new category
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const emptyForm = {
  name: '',
  cat_id: '',
  type: 'Software',
  short_desc: '',
  full_desc: '',
  features: [''],
  specs: [{ key: '', value: '' }],
}

type ImagePreview = { file: File; preview: string }

const AdminProducts = () => {
  const [productList, setProductList] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const [showForm, setShowForm] = useState(false)
  const [, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [,setDeletingCategoryId] = useState<number | null>(null)
  const [selected, setSelected] = useState<number[]>([])

  const [form, setForm] = useState({ ...emptyForm })
  const [editingProduct, setEditingProduct] = useState<any | null>(null)

  // File states
  const [mainImage, setMainImage] = useState<ImagePreview | null>(null)
  const [catalogueFile, setCatalogueFile] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<ImagePreview[]>([])

  // Existing URLs when editing
  const [existingImage, setExistingImage] = useState('')
  const [existingCatalogue, setExistingCatalogue] = useState('')
  const [existingGallery, setExistingGallery] = useState<string[]>([])

  const mainImageRef = useRef<HTMLInputElement>(null)
  const catalogueRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const tabs = ['All', 'Software', 'Hardware']

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { fetchProducts() }, [search, activeTab])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data || [])
    } catch (e) { console.error(e) }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts(search, activeTab)
      setProductList(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleSelectAll = (checked: boolean) =>
    setSelected(checked ? productList.map(p => p.prod_id) : [])

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id)
      setProductList(prev => prev.filter(p => p.prod_id !== id))
      setSelected(prev => prev.filter(x => x !== id))
      setDeleteId(null)
    } catch (e) { console.error(e) }
  }

  const handleDeleteSelected = async () => {
    try {
      await deleteProducts(selected)
      setProductList(prev => prev.filter(p => !selected.includes(p.prod_id)))
      setSelected([])
    } catch (e) { console.error(e) }
  }

  const handleToggleActive = async (product: any) => {
    try {
      await toggleProduct(product.prod_id, !product.is_active)
      setProductList(prev => prev.map(p => p.prod_id === product.prod_id ? { ...p, is_active: !p.is_active } : p))
    } catch (e) { console.error(e) }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFeatureChange = (i: number, val: string) => {
    const updated = [...form.features]; updated[i] = val
    setForm(prev => ({ ...prev, features: updated }))
  }
  const addFeature = () => setForm(prev => ({ ...prev, features: [...prev.features, ''] }))
  const removeFeature = (i: number) => setForm(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))

  const handleSpecChange = (i: number, field: 'key' | 'value', val: string) => {
    const updated = [...form.specs]; updated[i] = { ...updated[i], [field]: val }
    setForm(prev => ({ ...prev, specs: updated }))
  }
  const addSpec = () => setForm(prev => ({ ...prev, specs: [...prev.specs, { key: '', value: '' }] }))
  const removeSpec = (i: number) => setForm(prev => ({ ...prev, specs: prev.specs.filter((_, idx) => idx !== i) }))

  const handleMainImage = (file: File) => {
    setMainImage({ file, preview: URL.createObjectURL(file) })
  }

  const handleGalleryAdd = (files: FileList) => {
    const newImgs = Array.from(files).map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setGalleryImages(prev => [...prev, ...newImgs])
  }

  const removeGalleryImage = (i: number) => {
    setGalleryImages(prev => prev.filter((_, idx) => idx !== i))
  }

  const openEditModal = async (product: any) => {
    try {
      const full = await getProduct(product.prod_id)
      setEditingProduct(full)
      setForm({
        name: full.name || '',
        cat_id: full.cat_id || '',
        type: full.type || 'Software',
        short_desc: full.short_desc || '',
        full_desc: full.full_desc || '',
        features: full.features?.length
          ? full.features.map((f: any) => f.feature_text || f)
          : [''],
        specs: full.specs?.length
          ? full.specs.map((s: any) => ({ key: s.spec_key || '', value: s.spec_value || '' }))
          : [{ key: '', value: '' }],
      })
      setExistingImage(full.image_path || '')
      setExistingCatalogue(full.catalogue_path || '')
      setMainImage(null)
      setCatalogueFile(null)
      setGalleryImages([])
      setExistingGallery(full.images?.map((img: any) => typeof img === 'string' ? img : img.img_path).filter(Boolean) || [])
      setShowForm(true)
    } catch (e) { console.error(e) }
  }

  const resetModal = () => {
    setShowForm(false)
    setShowAddCategory(false)
    setNewCategoryName('')
    setEditingProduct(null)
    setForm({ ...emptyForm })
    setMainImage(null)
    setCatalogueFile(null)
    setGalleryImages([])
    setExistingImage('')
    setExistingCatalogue('')
    setExistingGallery([])
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      const created = await addCategory(newCategoryName.trim())
      setCategories(prev => [...prev, created])
      setForm(prev => ({ ...prev, cat_id: created.cat_id }))
      setNewCategoryName('')
      setShowAddCategory(false)
    } catch (e) { console.error(e) }
  }

  const handleSave = async () => {
    if (!form.name || !form.short_desc) return

    try {
      setSaving(true)

      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('cat_id', form.cat_id.toString())
      fd.append('type', form.type)
      fd.append('short_desc', form.short_desc)
      fd.append('full_desc', form.full_desc)
      fd.append('features', JSON.stringify(form.features.filter(f => f.trim())))
      fd.append('specs', JSON.stringify(
        form.specs.filter(s => s.key.trim()).map(s => ({ spec_key: s.key, spec_value: s.value }))
      ))

      if (mainImage) fd.append('image', mainImage.file)
      if (catalogueFile) fd.append('catalogue', catalogueFile)
      galleryImages.forEach(img => fd.append('images', img.file))

      if (editingProduct) {
        fd.append('existing_image', existingImage)
        fd.append('existing_catalogue', existingCatalogue)
        fd.append('existing_gallery', JSON.stringify(existingGallery))
        await updateProduct(editingProduct.prod_id, fd)
      } else {
        await addProduct(fd)
      }

      await fetchProducts()
      resetModal()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <span>Home</span><span>/</span>
            <span className="text-gray-700 font-medium">Products</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditingProduct(null); setForm({ ...emptyForm }); setShowForm(true) }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="p-8">

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search products..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
              onChange={e => {
                if (e.target.value === 'all') setSearch('')
                else setSearch(e.target.value)
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.cat_id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >{tab}</button>
              ))}
            </div>
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}><List size={16} /></button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}><LayoutGrid size={16} /></button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing <span className="font-semibold text-gray-900">{productList.length}</span> products
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {viewMode === 'list' && (
                <div className="grid grid-cols-6 px-6 py-3 border-b border-gray-100 text-xs uppercase font-semibold text-gray-400">
                  <span>
                    <input type="checkbox"
                      checked={productList.length > 0 && selected.length === productList.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </span>
                  <span className="col-span-2">Product</span>
                  <span>Category</span>
                  <span>Type</span>
                  <span>Actions</span>
                </div>
              )}

              {productList.length === 0 ? (
                <div className="text-center py-20">
                  <Package size={30} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No products found</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                  {productList.map(product => (
                    <div key={product.prod_id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all">
                      <div className="h-40 bg-blue-50 flex items-center justify-center overflow-hidden">
                        {product.image_path
                          ? <img src={product.image_path} alt={product.name} className="w-full h-full object-cover" />
                          : <Package size={30} className="text-blue-300" />}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{product.category}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${product.type === 'Hardware' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {product.type}
                          </span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => openEditModal(product)} className="text-green-600 hover:text-green-700"><Edit size={15} /></button>
                            <button onClick={() => handleToggleActive(product)} className={`${product.is_active ? 'text-orange-500 hover:text-orange-700' : 'text-teal-600 hover:text-teal-700'}`}>
                              <PowerOff size={15} />
                            </button>
                            <button onClick={() => setDeleteId(product.prod_id)} className="text-red-600 hover:text-red-700"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                productList.map(product => (
                  <div key={product.prod_id} className="grid grid-cols-6 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50">
                    <span>
                      <input type="checkbox" checked={selected.includes(product.prod_id)} onChange={() => toggleSelect(product.prod_id)} />
                    </span>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg overflow-hidden flex items-center justify-center">
                        {product.image_path
                          ? <img src={product.image_path} alt={product.name} className="w-full h-full object-contain" />
                          : <Package size={18} className="text-blue-500" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-400">#{product.prod_id}</p>
                          {!product.is_active && <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full">Discontinued</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{product.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold w-fit ${product.type === 'Hardware' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {product.type}
                    </span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEditModal(product)} className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm">
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => handleToggleActive(product)} className={`flex items-center gap-1 text-sm ${product.is_active ? 'text-orange-500 hover:text-orange-700' : 'text-teal-600 hover:text-teal-700'}`}>
                        <PowerOff size={14} /> {product.is_active ? 'Discontinue' : 'Activate'}
                      </button>
                      <button onClick={() => setDeleteId(product.prod_id)} className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* BULK DELETE BAR */}
        {selected.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-100 shadow-xl rounded-2xl px-6 py-3 flex items-center gap-4 z-50">
            <p className="text-sm font-medium text-gray-700">{selected.length} selected</p>
            <button onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
              <Trash2 size={14} /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={resetModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-5">

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Marg ERP Software" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <CategoryDropdown
                    categories={categories}
                    value={form.cat_id}
                    onChange={val => setForm(prev => ({ ...prev, cat_id: val }))}
                    onDelete={id => setDeletingCategoryId(id)}
                    onAdd={handleAddCategory}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" value={form.type} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Software</option>
                    <option>Hardware</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                  <input name="short_desc" value={form.short_desc} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief one-line description" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea name="full_desc" value={form.full_desc} onChange={handleFormChange} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Detailed product description" />
                </div>
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image</label>
                <div
                  onClick={() => mainImageRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleMainImage(f) }}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  {mainImage ? (
                    <div className="flex items-center gap-3 justify-center">
                      <img src={mainImage.preview} className="w-16 h-16 object-cover rounded-lg" alt="Main preview" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{mainImage.file.name}</p>
                        <p className="text-xs text-gray-400">{(mainImage.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={e => { e.stopPropagation(); setMainImage(null) }} className="ml-2 text-red-500 hover:text-red-700"><X size={16} /></button>
                    </div>
                  ) : existingImage ? (
                    <div className="relative flex items-center justify-center">
                      <img src={existingImage} className="w-full h-32 object-contain rounded-lg" alt="Existing main" />
                      <button type="button"
                        onClick={e => { e.stopPropagation(); if (window.confirm('Are you sure you want to remove this image?')) setExistingImage('') }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      ><X size={12} /></button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop or <span className="text-blue-600 font-medium">browse</span></p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  )}
                </div>
                <input ref={mainImageRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleMainImage(f) }} />
              </div>

              {/* Brochure / Catalogue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brochure / Catalogue <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div
                  onClick={() => catalogueRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  {catalogueFile ? (
                    <div className="flex items-center gap-3 justify-center">
                      <FileText size={20} className="text-blue-500" />
                      <p className="text-sm font-medium text-gray-900">{catalogueFile.name}</p>
                      <button type="button" onClick={e => { e.stopPropagation(); setCatalogueFile(null) }} className="ml-2 text-red-500 hover:text-red-700"><X size={16} /></button>
                    </div>
                  ) : existingCatalogue ? (
                    <div className="flex items-center gap-3 justify-center">
                      <FileText size={20} className="text-blue-500" />
                      <p className="text-sm text-gray-500">{existingCatalogue.split('/').pop()?.replace(/_/g, ' ') || 'Brochure uploaded'}</p>
                      <a href={existingCatalogue} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >View</a>
                      <button type="button"
                        onClick={e => { e.stopPropagation(); if (window.confirm('Are you sure you want to remove this brochure?')) setExistingCatalogue('') }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      ><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center text-gray-400">
                      <FileText size={18} />
                      <p className="text-sm">Upload PDF brochure (optional)</p>
                    </div>
                  )}
                </div>
                <input ref={catalogueRef} type="file" accept=".pdf,application/pdf" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setCatalogueFile(f) }} />
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Images <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div
                  onClick={() => galleryRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    if (e.dataTransfer.files?.length) handleGalleryAdd(e.dataTransfer.files)
                  }}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-2 justify-center text-gray-400">
                    <Upload size={18} />
                    <p className="text-sm">Upload additional images (optional)</p>
                  </div>
                </div>
                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => { if (e.target.files) handleGalleryAdd(e.target.files) }} />

                {/* Display existing and newly added gallery previews */}
                {(existingGallery.length > 0 || galleryImages.length > 0) && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {existingGallery.map((url, idx) => (
                      <div key={`exist-${idx}`} className="relative h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => setExistingGallery(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {galleryImages.map((img, idx) => (
                      <div key={`new-${idx}`} className="relative h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <img src={img.preview} alt="New Gallery" className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Features</label>
                {form.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={e => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.features.length > 1 && (
                      <button type="button" onClick={() => removeFeature(index)} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addFeature} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-1">
                  <Plus size={14} /> Add Feature
                </button>
              </div>

              {/* Specifications Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
                {form.specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={e => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="Key (e.g. Processor)"
                      className="w-1/3 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={e => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g. Intel i7)"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.specs.length > 1 && (
                      <button type="button" onClick={() => removeSpec(index)} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSpec} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-1">
                  <Plus size={14} /> Add Specification
                </button>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
              <button type="button" onClick={resetModal} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminProducts