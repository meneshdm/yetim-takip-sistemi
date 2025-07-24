"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Users, Heart } from "lucide-react";

interface Person {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Orphan {
  id: string;
  name: string;
  age: number | null;
  monthlyFee: number;
}

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: {
    id: string;
    name: string;
  } | null;
}

export function EditGroupModal({ isOpen, onClose, onSuccess, group }: EditGroupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    perPersonFee: "",
    startMonth: new Date().getMonth() + 1,
    startYear: new Date().getFullYear()
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedOrphans, setSelectedOrphans] = useState<string[]>([]);
  const [availablePeople, setAvailablePeople] = useState<Person[]>([]);
  const [availableOrphans, setAvailableOrphans] = useState<Orphan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState("");

  // Grup detaylarını ve mevcut verileri getir
  const fetchGroupData = async () => {
    if (!group) return;
    
    setIsLoadingData(true);
    try {
      // Grup detaylarını getir
      const groupResponse = await fetch(`/api/groups/${group.id}`);
      if (!groupResponse.ok) throw new Error('Grup detayları alınamadı');
      const groupData = await groupResponse.json();

      // Mevcut kişileri ve yetimleri getir
      const [peopleResponse, orphansResponse] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/orphans')
      ]);

      if (!peopleResponse.ok || !orphansResponse.ok) {
        throw new Error('Veriler alınamadı');
      }

      const [people, orphans] = await Promise.all([
        peopleResponse.json(),
        orphansResponse.json()
      ]);

      setFormData({
        name: groupData.name,
        perPersonFee: groupData.perPersonFee?.toString() || "",
        startMonth: groupData.startMonth || new Date().getMonth() + 1,
        startYear: groupData.startYear || new Date().getFullYear()
      });
      setSelectedMembers(groupData.members.map((m: { person?: { id: string }; id: string }) => m.person ? m.person.id : m.id));
      setSelectedOrphans(groupData.orphans.map((o: { orphan?: { id: string }; id: string }) => o.orphan ? o.orphan.id : o.id));
      setAvailablePeople(people);
      setAvailableOrphans(orphans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (group && isOpen) {
      fetchGroupData();
    }
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          perPersonFee: formData.perPersonFee,
          startMonth: formData.startMonth,
          startYear: formData.startYear,
          memberIds: selectedMembers,
          orphanIds: selectedOrphans
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberToggle = (personId: string) => {
    setSelectedMembers(prev => 
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleOrphanToggle = (orphanId: string) => {
    setSelectedOrphans(prev => 
      prev.includes(orphanId)
        ? prev.filter(id => id !== orphanId)
        : [...prev, orphanId]
    );
  };

  const handleClose = () => {
    if (!isLoading) {
      setError("");
      onClose();
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Grup Düzenle: {group.name}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Veriler yükleniyor...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Grup Adı *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Grup adını girin"
                  />
                </div>

                <div>
                  <label htmlFor="perPersonFee" className="block text-sm font-medium text-gray-700 mb-2">
                    Kişi Başı Ücret (₺)
                  </label>
                  <input
                    type="number"
                    id="perPersonFee"
                    step="0.01"
                    min="0"
                    value={formData.perPersonFee}
                    onChange={(e) => setFormData({ ...formData, perPersonFee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: 100.00"
                  />
                </div>
              </div>

              {/* Başlangıç Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startMonth" className="block text-xs text-gray-500 mb-1">
                      Ay
                    </label>
                    <select
                      id="startMonth"
                      value={formData.startMonth}
                      onChange={(e) => setFormData({ ...formData, startMonth: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const monthName = new Date(2024, i).toLocaleDateString('tr-TR', { month: 'long' });
                        return (
                          <option key={month} value={month}>
                            {monthName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="startYear" className="block text-xs text-gray-500 mb-1">
                      Yıl
                    </label>
                    <select
                      id="startYear"
                      value={formData.startYear}
                      onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Bu tarihten itibaren ödeme takibi yapılır
                </p>
              </div>

              {/* Members Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Users className="inline h-4 w-4 mr-2" />
                  Grup Üyeleri ({selectedMembers.length} seçili)
                </label>
                <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                  {availablePeople.length > 0 ? (
                    <div className="space-y-2">
                      {availablePeople.map((person) => (
                        <label key={person.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(person.id)}
                            onChange={() => handleMemberToggle(person.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{person.name}</div>
                            {person.email && (
                              <div className="text-xs text-gray-500">{person.email}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Henüz kişi bulunmuyor</p>
                  )}
                </div>
              </div>

              {/* Orphans Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Heart className="inline h-4 w-4 mr-2" />
                  Yetimler ({selectedOrphans.length} seçili)
                </label>
                <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                  {availableOrphans.length > 0 ? (
                    <div className="space-y-2">
                      {availableOrphans.map((orphan) => (
                        <label key={orphan.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedOrphans.includes(orphan.id)}
                            onChange={() => handleOrphanToggle(orphan.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{orphan.name}</div>
                            <div className="text-xs text-gray-500">
                              {orphan.age && `${orphan.age} yaş - `}
                              Aylık: {orphan.monthlyFee.toLocaleString('tr-TR')} ₺
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Henüz yetim bulunmuyor</p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isLoadingData}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
