"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaFilter, FaThLarge, FaThList, FaInfoCircle, FaTimes, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface ExtendedSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface Product {
  id: string;
  name: string;
  code: string;
  image: string;
  category: string;
  price: number;
}

const SABITLER_SLOT = 24;

const sortOptions = [
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
];

export default function EditConstantsPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;
  const { data: session } = useSession() as { data: ExtendedSession | null };
  
  const [constantsPage, setConstantsPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const totalPages = 4;
  const [modalOpen, setModalOpen] = useState(false);
  const [saveModal, setSaveModal] = useState(false);

  const initialFilterState = {
    filterType: "",
    filterValue: "",
    depot: "",
    minStock: "",
    maxStock: "",
    productCode: "",
    allSizesInStock: false,
    sortBy: "",
  };
  const [filters, setFilters] = useState(initialFilterState);
  const [apiFilterOptions, setApiFilterOptions] = useState<any[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<any[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [constants, setConstants] = useState<Product[]>([]);

  const [removeModal, setRemoveModal] = useState(false);
  const [constantToRemove, setConstantToRemove] = useState<string | null>(null);

  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  const SLOTS_PER_PAGE = 6;
  const totalConstantsPages = Math.ceil(SABITLER_SLOT / SLOTS_PER_PAGE);

  const fetchProducts = async (additionalFilters: any[] = []) => {
    if (!session?.accessToken || !collectionId) return;

    const payload = {
        additionalFilters,
        page: 1,
        pageSize: 36
    };

    try {
        const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/${collectionId}/GetProductsForConstants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.status === 200) {
            const newProducts = result.data.data.map((p: any) => ({
                id: p.productCode,
                name: p.name || `Ürün ${p.productCode}`,
                code: p.productCode,
                image: p.imageUrl,
                category: 'Unknown',
                price: 0
            }));
            setProducts(newProducts);
        } else {
            console.error("Failed to fetch products:", result.message);
        }
    } catch (error) {
        console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    if (session?.accessToken && collectionId) {
        const fetchFilterOptions = async () => {
            try {
                const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/${collectionId}/GetFiltersForConstants`, {
                    headers: { Authorization: `Bearer ${session.accessToken}` },
                });
                const data = await res.json();
                if (data.status === 200) {
                    setApiFilterOptions(data.data);
                } else {
                    console.error("Failed to fetch filters:", data.message);
                }
            } catch (error) {
                console.error("Failed to fetch filters:", error);
            }
        };
        fetchFilterOptions();
        fetchProducts();
    }
  }, [collectionId, session]);


  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(products);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setProducts(items);
  };

  const handleAddConstant = (product: Product) => {
    if (constants.find(c => c.id === product.id) || constants.length >= SABITLER_SLOT) return;
    setConstants([...constants, product]);
  };
  const handleRemoveConstant = (id: string, confirmed = false) => {
    if (!confirmed) {
      setConstantToRemove(id);
      setRemoveModal(true);
      return;
    }
    if (Math.random() < 0.3) {
      setRemoveModal(false);
      setConstantToRemove(null);
      setErrorModal(true);
      return;
    }
    setConstants(prev => prev.filter(c => c.id !== id));
    setRemoveModal(false);
    setConstantToRemove(null);
    setSuccessModal(true);
  };

  const handleApplyFilter = () => {
    const additionalFilters = [];
    if (filters.filterType && filters.filterValue) {
        additionalFilters.push({
            id: filters.filterType,
            value: filters.filterValue,
            comparisonType: 0
        });
    }
    fetchProducts(additionalFilters);

    const newAppliedForDisplay = [];
    const filterDef = apiFilterOptions.find(f => f.id === filters.filterType);
    const valueDef = filterDef?.values.find((v:any) => v.value === filters.filterValue);
    if(filterDef && valueDef) {
      newAppliedForDisplay.push({ type: filterDef.title, value: valueDef.valueName || valueDef.value });
    }
    setAppliedFilters(newAppliedForDisplay);
    setModalOpen(false);
  };
  const handleClear = () => {
    setFilters(initialFilterState);
    setAppliedFilters([]);
    fetchProducts();
  };

  const handleFilterChange = (field: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [field]: value };
    if (field === 'filterType') {
      newFilters.filterValue = '';
    }
    setFilters(newFilters);
  };

  const getRequestData = () => ({
    order: products.map(p => p.id),
    constants: constants.map(c => c.id),
    filters: appliedFilters,
  });

  const dynamicFilterOptions = apiFilterOptions.map(f => ({ label: f.title, value: f.id }));
  const valueOptions = (filters.filterType && apiFilterOptions.find(f => f.id === filters.filterType)?.values) || [];

  return (
    <div className="flex flex-col gap-4 h-full p-4 sm:p-6">
  
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 flex items-center justify-between border rounded-md px-4 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <button className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><FaChevronLeft /></button>
          <span className="font-semibold">Yıl: 2024</span>
          <button className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><FaChevronRight /></button>
        </div>
        <button onClick={() => setModalOpen(true)} className="border rounded px-4 py-2 flex items-center gap-2 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"><FaFilter /> Filtreler</button>
      </div>
      {appliedFilters.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 text-sm mb-2">
          <span className="font-semibold">Uygulanan Kriterler: </span>
          {appliedFilters.map((f, i) => (
            <span key={i} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">{f.type}: {f.value}</span>
          ))}
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[400px]">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col overflow-hidden">
          <div className="font-semibold mb-2">Koleksiyon Ürünleri</div>
          <div className="flex-1 overflow-y-auto pr-2">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="products" direction="vertical">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {products.map((p, idx) => {
                      const isAdded = constants.some(c => c.id === p.id);
                      return (
                      <Draggable key={p.id} draggableId={p.id.toString()} index={idx} isDragDisabled={isAdded}>
                        {(prov, snapshot) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`border rounded-lg flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 transition-shadow relative ${snapshot.isDragging ? 'shadow-lg' : ''} ${isAdded ? 'cursor-not-allowed' : ''}`}
                          >
                            <div className="relative">
                                <img src={p.image} alt={p.name} className={`w-28 h-36 object-cover rounded mb-2 ${isAdded ? 'opacity-40' : ''}`} />
                                {isAdded && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black text-white text-sm font-semibold px-4 py-2">Eklendi</div>
                                    </div>
                                )}
                            </div>
                            <div className="font-medium text-sm mb-1">{p.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{p.code}</div>
                            {!isAdded && (
                                <button
                                  className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow ${constants.length >= SABITLER_SLOT ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                  onClick={() => handleAddConstant(p)}
                                  disabled={constants.length >= SABITLER_SLOT}
                                  title="Sabitlere Ekle"
                                >
                                  <FaPlus />
                                </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    )})}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Sabitler</span>
            <div className="flex items-center gap-2">
              <FaInfoCircle className="text-gray-400" />
              <button className={`w-8 h-8 flex items-center justify-center rounded ${view === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`} onClick={() => setView('grid')}><FaThLarge /></button>
              <button className={`w-8 h-8 flex items-center justify-center rounded ${view === 'list' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`} onClick={() => setView('list')}><FaThList /></button>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2">
              {view === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: SLOTS_PER_PAGE }).map((_, i) => {
                    const constantIndex = (constantsPage - 1) * SLOTS_PER_PAGE + i;
                    const c = constants[constantIndex];
                    return c ? (
                      <div key={`slot-${constantIndex}-${c.id}`} className="border rounded-lg flex flex-col items-center justify-center p-2 min-h-[120px] bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 relative">
                        <img src={c.image} alt={c.name} className="w-20 h-28 object-cover rounded mb-2" />
                        <div className="font-medium text-sm mb-1">{c.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.code}</div>
                        <button
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => handleRemoveConstant(c.id)}
                          title="Sabitten Çıkar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <div key={`slot-${constantIndex}`} className="border rounded-lg flex flex-col items-center justify-center p-2 min-h-[120px] bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5M3 16.5A2.25 2.25 0 0 0 5.25 18.75h13.5A2.25 2.25 0 0 0 21 16.5M3 16.5v-1.125c0-.621.504-1.125 1.125-1.125h15.75c.621 0 1.125.504 1.125 1.125V16.5" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: SLOTS_PER_PAGE }).map((_, i) => {
                    const constantIndex = (constantsPage - 1) * SLOTS_PER_PAGE + i;
                    const c = constants[constantIndex];
                    return c ? (
                      <div key={`slot-${constantIndex}-${c.id}`} className="border rounded-lg flex items-center gap-4 p-2 min-h-[60px] bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 relative">
                        <img src={c.image} alt={c.name} className="w-14 h-14 object-cover rounded" />
                        <div>
                          <div className="font-medium text-sm mb-1">{c.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{c.code}</div>
                        </div>
                        <button
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => handleRemoveConstant(c.id)}
                          title="Sabitten Çıkar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <div key={`slot-${constantIndex}`} className="border rounded-lg flex flex-col items-center justify-center p-2 min-h-[60px] bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5M3 16.5A2.25 2.25 0 0 0 5.25 18.75h13.5A2.25 2.25 0 0 0 21 16.5M3 16.5v-1.125c0-.621.504-1.125 1.125-1.125h15.75c.621 0 1.125.504 1.125 1.125V16.5" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-center items-center gap-2 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setConstantsPage(p => Math.max(1, p-1))} disabled={constantsPage === 1} className="p-2 rounded border disabled:opacity-50"><FaChevronLeft /></button>
              {Array.from({ length: totalConstantsPages }).map((_, i) => (
                  <button
                  key={i}
                  onClick={() => setConstantsPage(i + 1)}
                  className={`w-8 h-8 rounded border ${constantsPage === i + 1 ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                  >
                  {i + 1}
                  </button>
              ))}
              <button onClick={() => setConstantsPage(p => Math.min(totalConstantsPages, p+1))} disabled={constantsPage === totalConstantsPages} className="p-2 rounded border disabled:opacity-50"><FaChevronRight /></button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div></div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="px-6 py-2 rounded-md bg-black text-white font-semibold hover:bg-gray-800">Vazgeç</button>
          <button onClick={() => setSaveModal(true)} className="px-6 py-2 rounded-md bg-black text-white font-semibold hover:bg-gray-800">Kaydet</button>
        </div>
      </div>
      
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out flex items-center justify-center p-4 ${
          modalOpen ? "bg-black bg-opacity-30 opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setModalOpen(false)}
      >
        <div
          className={`w-full max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col max-h-[95vh] transform transition-all duration-300 ease-in-out ${
            modalOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Filtrele</h2>
            <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaTimes className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex-grow p-6 space-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="space-y-2 col-span-1">
                <label className="font-semibold text-sm text-gray-700 dark:text-gray-200">Filtreler</label>
                <select 
                  value={filters.filterType}
                  onChange={(e) => handleFilterChange('filterType', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Seçiniz</option>
                  {dynamicFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select 
                  value={filters.filterValue}
                  onChange={(e) => handleFilterChange('filterValue', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                  disabled={!filters.filterType}
                >
                  <option value="">Lütfen filtre seçiniz</option>
                  {valueOptions.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.valueName || opt.value}</option>)}
                </select>
              </div>

              <div className="space-y-2 col-span-1">
                <label className="font-semibold text-sm text-gray-700 dark:text-gray-200">Stok</label>
                <select 
                  value={filters.depot}
                  onChange={(e) => handleFilterChange('depot', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Lütfen depo seçiniz</option>
                  {(apiFilterOptions.find(f => f.id === 'warehouse')?.values || []).map((opt: any) => <option key={opt.value} value={opt.value}>{opt.valueName || opt.value}</option>)}
                </select>
                <input 
                  type="number"
                  placeholder="Minimum Stok" 
                  value={filters.minStock}
                  onChange={(e) => handleFilterChange('minStock', e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <input 
                  type="number"
                  placeholder="Maksimum Stok"
                  value={filters.maxStock}
                  onChange={(e) => handleFilterChange('maxStock', e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2 col-span-1">
                  <label className="font-semibold text-sm text-gray-700 dark:text-gray-200">Ürün Kodu</label>
                  <input 
                    type="text" 
                    placeholder="Seçiniz"
                    value={filters.productCode}
                    onChange={(e) => handleFilterChange('productCode', e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex items-center space-x-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="stock-check"
                        checked={filters.allSizesInStock}
                        onChange={(e) => handleFilterChange('allSizesInStock', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="stock-check" className="text-sm text-gray-600 dark:text-gray-300">Tüm Bedenlerinde Stok Olanlar</label>
                  </div>
              </div>

              <div className="space-y-2 col-span-1">
                  <label className="font-semibold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <FaInfoCircle className="text-gray-400"/>
                      Sıralamalar
                  </label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                  >
                      <option value="">Seçiniz</option>
                      {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-sm text-gray-700 dark:text-gray-200">Uygulanan Kriterler</label>
              <div className="w-full h-24 p-2 border rounded-md mt-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-300 overflow-y-auto">
                {appliedFilters.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-2 mr-2 mb-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                    {f.type}: {f.value}
                    <button onClick={() => setAppliedFilters(current => current.filter(item => item.value !== f.value))} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4">
            <button onClick={handleClear} className="px-6 py-2 rounded-md bg-black text-white font-semibold hover:bg-gray-800">Seçimi Temizle</button>
            <button onClick={handleApplyFilter} className="px-6 py-2 rounded-md border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700">Ara</button>
          </div>
        </div>
      </div>

      {removeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in flex flex-col items-center">
            <div className="font-bold text-3xl mb-4 text-center">Uyarı!</div>
            <p className="text-center mb-8">Bu sabiti silmek istediğinize emin misiniz?</p>
            <div className="flex gap-4">
              <button onClick={() => setRemoveModal(false)} className="px-6 py-2 rounded-md border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700">İptal</button>
              <button onClick={() => handleRemoveConstant(constantToRemove!, true)} className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}

      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in flex flex-col items-center">
            <div className="text-green-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="font-bold text-3xl mb-4 text-center">Başarılı!</div>
            <p className="text-center mb-8">Sabit başarıyla silindi.</p>
            <button onClick={() => setSuccessModal(false)} className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700">Kapat</button>
          </div>
        </div>
      )}

      {errorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in flex flex-col items-center">
            <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="font-bold text-3xl mb-4 text-center">Hata!</div>
            <p className="text-center mb-8">Sabit silinirken bir hata oluştu.</p>
            <button onClick={() => setErrorModal(false)} className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700">Kapat</button>
          </div>
        </div>
      )}

      {saveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-xl relative animate-fade-in">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white" onClick={() => setSaveModal(false)}><FaTimes size={22} /></button>
            <div className="font-bold text-lg mb-4">Gönderilecek Request</div>
            <pre className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-xs overflow-x-auto max-h-96">{JSON.stringify(getRequestData(), null, 2)}</pre>
            <div className="flex justify-end mt-4">
              <button className="bg-black text-white rounded px-6 py-2 dark:bg-gray-600 dark:hover:bg-gray-500" onClick={() => setSaveModal(false)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 