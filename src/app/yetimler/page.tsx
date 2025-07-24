"use client";

import { useState, useEffect } from "react";
import { Plus, Heart, MapPin, Calendar, FileText, Edit, Trash2, Loader2, Upload } from "lucide-react";
import { AddOrphanModal } from "@/components/AddOrphanModal";
import { EditOrphanModal } from "@/components/EditOrphanModal";
import { FileUploadModal } from "@/components/FileUploadModal";
import AuthWrapper from "@/components/AuthWrapper";

interface Orphan {
  id: number;
  name: string;
  age: number | null;
  location: string | null;
  monthlyFee: number;
  description: string | null;
  documents: string | null;
  createdAt: string;
}

export default function YetimlerPage() {
  return (
    <AuthWrapper>
      <YetimlerContent />
    </AuthWrapper>
  );
}

function YetimlerContent() {
  const [orphans, setOrphans] = useState<Orphan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedOrphan, setSelectedOrphan] = useState<Orphan | null>(null);

  const fetchOrphans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orphans');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Yetimler yüklenirken hata oluştu');
      }
      
      setOrphans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrphans();
  }, []);

  const handleModalSuccess = () => {
    fetchOrphans(); // Listeyi yenile
  };

  const handleDeleteOrphan = async (orphanId: number, orphanName: string) => {
    if (!confirm(`"${orphanName}" adlı yetimi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orphans/${orphanId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Yetim silinemedi');
      }

      // Listeyi yenile
      fetchOrphans();
      alert('Yetim başarıyla silindi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Yetim silinirken hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getDocuments = (documentsString: string | null) => {
    if (!documentsString) return [];
    try {
      return JSON.parse(documentsString);
    } catch {
      return [];
    }
  };

  const toplamYetim = orphans.length;
  const toplamAylikMaliyet = orphans.reduce((sum: number, orphan) => sum + orphan.monthlyFee, 0);
  const ortalamaYas = orphans.length > 0 ? Math.round(orphans.reduce((sum: number, orphan) => sum + (orphan.age || 0), 0) / orphans.length) : 0;

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Yetim Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yetimler</h1>
          <p className="text-gray-600 mt-1">
            Yetim profilleri ve dosya yönetimi
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Yetim Ekle</span>
        </button>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {/* Yetim İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {toplamYetim}
                  </div>
                  <div className="text-gray-600">Toplam Yetim</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {ortalamaYas || 0}
                  </div>
                  <div className="text-gray-600">Ortalama Yaş</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {toplamAylikMaliyet.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-gray-600">Aylık Maliyet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Yetimler Grid */}
          {orphans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orphans.map((orphan) => (
                <div key={orphan.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Profil Resmi Alanı */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <Heart className="h-16 w-16 text-gray-400" />
                  </div>

                  <div className="p-6">
                    {/* İsim ve Yaş */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {orphan.name}
                      </h3>
                      {orphan.age && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {orphan.age} yaş
                        </span>
                      )}
                    </div>

                    {/* Konum */}
                    {orphan.location && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{orphan.location}</span>
                      </div>
                    )}

                    {/* Aylık Ücret */}
                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <div className="text-xs text-green-600 font-medium mb-1">
                        Aylık Ücret
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        {orphan.monthlyFee.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>

                    {/* Açıklama */}
                    {orphan.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {orphan.description}
                      </p>
                    )}

                    {/* Dosyalar */}
                    {getDocuments(orphan.documents).length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Dosyalar:</div>
                        <div className="space-y-1">
                          {getDocuments(orphan.documents).map((doc: { filename: string; filePath: string }, index: number) => (
                            <div key={index} className="flex items-center text-sm text-blue-600">
                              <FileText className="h-3 w-3 mr-1" />
                              <a 
                                href={doc.filePath} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline truncate"
                              >
                                {doc.filename}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kayıt Tarihi */}
                    <div className="text-xs text-gray-500 mb-4">
                      Kayıt: {formatDate(orphan.createdAt)}
                    </div>

                    {/* İşlem Butonları */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedOrphan(orphan);
                          setIsFileModalOpen(true);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Dosya Ekle
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedOrphan(orphan);
                          setIsEditModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDeleteOrphan(orphan.id, orphan.name)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Boş Durum */
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz yetim kaydı yok
              </h3>
              <p className="text-gray-500 mb-6">
                İlk yetim kaydını oluşturarak başlayın
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>İlk Yetimi Ekle</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Orphan Modal */}
      <AddOrphanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Orphan Modal */}
      <EditOrphanModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrphan(null);
        }}
        orphan={selectedOrphan}
        onSuccess={handleModalSuccess}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => {
          setIsFileModalOpen(false);
          setSelectedOrphan(null);
        }}
        orphan={selectedOrphan}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
