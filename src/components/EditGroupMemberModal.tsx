"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar } from "lucide-react";

interface MembershipPeriod {
  from: { month: number; year: number };
  to: { month: number; year: number } | null;
}

interface GroupMember {
  id: string;
  person: {
    id: string;
    name: string;
    email?: string;
  };
  customAmount?: number;
  isActive: boolean;
}

interface EditGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: GroupMember | null;
  groupName: string;
  membershipDates: MembershipPeriod[];
  onSave: (memberData: {
    customAmount: number;
    isActive: boolean;
    membershipDates: MembershipPeriod[];
  }) => void;
}

export default function EditGroupMemberModal({
  isOpen,
  onClose,
  member,
  groupName,
  membershipDates,
  onSave,
}: EditGroupMemberModalProps) {
  const [customAmount, setCustomAmount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [periods, setPeriods] = useState<MembershipPeriod[]>([]);

  useEffect(() => {
    if (member) {
      setCustomAmount(member.customAmount || 0);
      setIsActive(member.isActive);
      setPeriods(membershipDates.length > 0 ? membershipDates : [
        { from: { month: 1, year: 2023 }, to: null }
      ]);
    }
  }, [member, membershipDates]);

  const handleSave = () => {
    onSave({
      customAmount,
      isActive,
      membershipDates: periods,
    });
    onClose();
  };

  const addPeriod = () => {
    setPeriods([...periods, { from: { month: 1, year: 2023 }, to: null }]);
  };

  const removePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

    const updatePeriod = (index: number, field: string, value: string | number | boolean) => {
    const newPeriods = [...periods];
    if (field === 'fromMonth') {
      newPeriods[index].from.month = parseInt(value.toString());
    } else if (field === 'fromYear') {
      newPeriods[index].from.year = parseInt(value.toString());
    } else if (field === 'toMonth') {
      if (newPeriods[index].to) {
        newPeriods[index].to!.month = parseInt(value.toString());
      } else {
        newPeriods[index].to = { month: parseInt(value.toString()), year: new Date().getFullYear() };
      }
    } else if (field === 'toYear') {
      if (newPeriods[index].to) {
        newPeriods[index].to!.year = parseInt(value.toString());
      } else {
        newPeriods[index].to = { month: 1, year: parseInt(value.toString()) };
      }
    } else if (field === 'hasEndDate') {
      if (!value) {
        newPeriods[index].to = null;
      } else if (!newPeriods[index].to) {
        newPeriods[index].to = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
      }
    }
    setPeriods(newPeriods);
  };

  const formatMonth = (month: number) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Üye Düzenle: {member.person.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Grup Bilgisi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grup
            </label>
            <input
              type="text"
              value={groupName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Özel Tutar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Özel Tutar (₺)
            </label>
            <input
              type="number"
              step="0.01"
              value={customAmount}
              onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Aktif Durumu */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Aktif üye
              </span>
            </label>
          </div>

          {/* Üyelik Dönemleri */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Üyelik Dönemleri
              </label>
              <button
                onClick={addPeriod}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Dönem Ekle
              </button>
            </div>

            <div className="space-y-4">
              {periods.map((period, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dönem {index + 1}
                    </h4>
                    {periods.length > 1 && (
                      <button
                        onClick={() => removePeriod(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* Başlangıç Tarihi */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Başlangıç
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={period.from.month}
                          onChange={(e) => updatePeriod(index, 'fromMonth', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {formatMonth(i + 1)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={period.from.year}
                          onChange={(e) => updatePeriod(index, 'fromYear', e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    {/* Bitiş Tarihi */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Bitiş
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={period.to !== null}
                            onChange={(e) => updatePeriod(index, 'hasEndDate', e.target.checked)}
                            className="h-3 w-3 text-blue-600"
                          />
                          <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                            Bitiş tarihi var
                          </span>
                        </label>
                        {period.to && (
                          <div className="flex gap-2">
                            <select
                              value={period.to.month}
                              onChange={(e) => updatePeriod(index, 'toMonth', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {formatMonth(i + 1)}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={period.to.year}
                              onChange={(e) => updatePeriod(index, 'toYear', e.target.value)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dönem Özeti */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {formatMonth(period.from.month)} {period.from.year} - {
                      period.to 
                        ? `${formatMonth(period.to.month)} ${period.to.year}`
                        : 'Devam ediyor'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
