"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Heart, Edit, Trash2, Loader2, Eye } from "lucide-react";
import { AddGroupModal } from "@/components/AddGroupModal";
import { EditGroupModal } from "@/components/EditGroupModal";
import AuthWrapper from "@/components/AuthWrapper";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  memberCount: number;
  orphanCount: number;
  totalMonthlyAmount: number;
  createdAt: string;
}

export default function GruplarPage() {
  return (
    <AuthWrapper>
      <GruplarContent />
    </AuthWrapper>
  );
}

function GruplarContent() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/groups');
      
      if (!response.ok) {
        throw new Error('Gruplar getirilemedi');
      }
      
      const data = await response.json();
      setGroups(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" grubunu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Grup silinemedi');
      }

      // Grubu listeden kaldır
      setGroups(groups.filter(group => group.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Grup silinemedi');
    }
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setIsEditModalOpen(true);
  };

  const totalGroups = groups.length;
  const totalMembers = groups.reduce((sum, group) => sum + group.memberCount, 0);
  const totalOrphans = groups.reduce((sum, group) => sum + group.orphanCount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Grup Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gruplar</h1>
          <p className="text-gray-600 mt-1">
            Grup yönetimi, kişi ve yetim atamaları
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Grup</span>
        </button>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Grup İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalGroups}
              </div>
              <div className="text-gray-600">Toplam Grup</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalMembers}
              </div>
              <div className="text-gray-600">Toplam Üye</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalOrphans}
              </div>
              <div className="text-gray-600">Toplam Yetim</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gruplar Listesi */}
      {groups.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Tüm Gruplar
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grup Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Üye Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yetim Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aylık Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturulma
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {group.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.memberCount} kişi
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.orphanCount} yetim
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {group.totalMonthlyAmount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => router.push(`/gruplar/${group.id}`)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Grup Detayı"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditGroup(group)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz grup oluşturulmamış
          </h3>
          <p className="text-gray-500 mb-6">
            İlk grubunuzu oluşturarak başlayın
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>İlk Grubu Oluştur</span>
          </button>
        </div>
      )}

      {/* Add Group Modal */}
      <AddGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchGroups}
      />

      {/* Edit Group Modal */}
      {selectedGroup && (
        <EditGroupModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
          onSuccess={fetchGroups}
        />
      )}
    </div>
  );
}
