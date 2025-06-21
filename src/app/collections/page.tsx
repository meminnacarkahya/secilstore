"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Collection {
  id: number;
  name: string;
  filters: { title: string; valueName: string }[];
  salesChannelId: number;
}

interface ExtendedSession {
  accessToken?: string;
}

const PAGE_SIZE = 5;

export default function CollectionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.accessToken) {
      router.push("/login");
      return;
    }
    const fetchCollections = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("https://maestro-api-dev.secil.biz/Collection/GetAll", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Koleksiyonlar alınamadı");
        const data = await res.json();
        setCollections(
          (data.data || []).map((item: any) => ({
            id: item.id,
            name: item.info?.name || `Koleksiyon #${item.id}`,
            filters: (item.filters?.filters || []).map((f: any) => ({
              title: f.title,
              valueName: f.valueName,
            })),
            salesChannelId: item.salesChannelId,
          }))
        );
      } catch (e: any) {
        setError(e.message || "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [session, status, router]);

  const handleEdit = (id: number) => {
    router.push(`/collections/${id}/edit`);
  };

  // Pagination
  const totalPages = Math.ceil(collections.length / PAGE_SIZE);
  const pagedCollections = collections.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-start justify-center">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow p-8 mt-6">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-left font-semibold">Başlık</th>
              <th className="py-3 px-4 text-left font-semibold">Ürün Koşulları</th>
              <th className="py-3 px-4 text-left font-semibold">Satış Kanalı</th>
              <th className="py-3 px-4 text-left font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Yükleniyor...</td></tr>
            ) : error ? (
              <tr><td colSpan={4} className="text-center py-8 text-red-500">{error}</td></tr>
            ) : pagedCollections.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Koleksiyon bulunamadı</td></tr>
            ) : (
              pagedCollections.map((col) => (
                <tr key={col.id} className="border-b">
                  <td className="py-4 px-4 align-top whitespace-nowrap">{col.name}</td>
                  <td className="py-4 px-4 align-top">
                    {col.filters.length > 0 ? (
                      <ul className="list-none space-y-1">
                        {col.filters.map((f, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            Ürün {f.title} bilgisi Şuna Eşit: {f.valueName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4 align-top">Satış Kanalı - {col.salesChannelId}</td>
                  <td className="py-4 px-4 align-top text-center">
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100"
                      onClick={() => handleEdit(col.id)}
                      title="Sabitleri Düzenle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.44 18.85a4.2 4.2 0 0 1-1.768 1.06l-3.07.878.878-3.07a4.2 4.2 0 0 1 1.06-1.768L16.862 4.487ZM19.5 6.75l-1.5-1.5" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-end mt-8">
            <nav className="flex items-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Önceki"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${page === i + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Sonraki"
              >
                &gt;
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 