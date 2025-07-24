"use client";

import { useState, useEffect } from "react";
import { Plus, UserPlus, CheckCircle, XCircle, Loader2, Edit, Trash2 } from "lucide-react";
import { AddPersonModal } from "@/components/AddPersonModal";
import { EditPersonModal } from "@/components/EditPersonModal";
import AuthWrapper from "@/components/AuthWrapper";

interface Person {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  groups: string[];
  totalPayments: number;
  monthlyDebt: number;
  lastPayment: string;
  status: string;
  createdAt: string;
}

function KisilerContent() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const fetchPeople = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/people');
      
      if (!response.ok) {
        throw new Error('Kişiler getirilemedi');
      }
      
      const data = await response.json();
      setPeople(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleEditPerson = (person: Person) => {
    setSelectedPerson(person);
    setIsEditModalOpen(true);
  };

  const handleDeletePerson = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" kişisini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/people/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kişi silinemedi');
      }

      // Kişiyi listeden kaldır
      setPeople(people.filter(person => person.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kişi silinemedi');
    }
  };

  const getDurumBadge = (durum: string) => {
    if (durum === "güncel") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Güncel
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Borçlu
        </span>
      );
    }
  };

  const toplamKisi = people.length;
  const borcluSayisi = people.filter(k => k.status === "borçlu").length;
  const toplamOdeme = people.reduce((sum, kisi) => sum + kisi.totalPayments, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Kişi Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kişiler</h1>
          <p className="text-gray-600 mt-1">
            Bireysel ödeme ve borç takibi
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Kişi</span>
        </button>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Kişi İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {toplamKisi}
              </div>
              <div className="text-gray-600">Toplam Kişi</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {borcluSayisi}
              </div>
              <div className="text-gray-600">Borçlu Kişi</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {toplamOdeme.toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-gray-600">Toplam Ödeme</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kişiler Listesi */}
      {people.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Tüm Kişiler
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kişi Bilgileri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gruplar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Borç
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {people.map((kisi) => (
                  <tr key={kisi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {kisi.name}
                        </div>
                        {kisi.email && (
                          <div className="text-sm text-gray-500">
                            {kisi.email}
                          </div>
                        )}
                        {kisi.phone && (
                          <div className="text-sm text-gray-500">
                            {kisi.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {kisi.groups.length > 0 ? (
                          kisi.groups.map((grup, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {grup}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">Grup yok</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {kisi.totalPayments.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {kisi.monthlyDebt > 0 ? (
                        <span className="text-sm font-medium text-red-600">
                          {kisi.monthlyDebt.toLocaleString('tr-TR')} ₺
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Borç yok
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kisi.lastPayment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDurumBadge(kisi.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button 
                          onClick={() => handleEditPerson(kisi)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center transition-colors"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Düzenle
                        </button>
                        <button 
                          onClick={() => handleDeletePerson(kisi.id, kisi.name)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Boş Durum */
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz kişi eklenmemiş
          </h3>
          <p className="text-gray-500 mb-6">
            İlk kişiyi ekleyerek başlayın
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>İlk Kişiyi Ekle</span>
          </button>
        </div>
      )}

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchPeople}
      />

      {/* Edit Person Modal */}
      {selectedPerson && (
        <EditPersonModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPerson(null);
          }}
          person={selectedPerson}
          onSuccess={fetchPeople}
        />
      )}
    </div>
  );
}

export default function KisilerPage() {
  return (
    <AuthWrapper>
      <KisilerContent />
    </AuthWrapper>
  );
}
