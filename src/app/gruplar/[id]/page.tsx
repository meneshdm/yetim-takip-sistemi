"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Heart, Calculator, Save, Edit, UserPlus, UserMinus, DollarSign, CheckCircle, XCircle, Settings } from "lucide-react";
import EditGroupMemberModal from "../../../components/EditGroupMemberModal";

interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  payments?: Payment[];
}

interface Payment {
  id: string;
  month: number;
  year: number;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
}

interface Orphan {
  id: string;
  name: string;
  monthlyFee: number;
  age?: number;
  location?: string;
}

interface GroupMember {
  id: string;
  person: Person;
  customAmount?: number;
  isActive: boolean;
}

interface GroupOrphanPayment {
  month: number;
  year: number;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
}

interface GroupDetail {
  id: string;
  name: string;
  perPersonFee?: number;
  startMonth?: number;
  startYear?: number;
  members: GroupMember[];
  orphans: { orphan: Orphan }[];
  orphanPayments?: GroupOrphanPayment[];
  totalMonthlyAmount: number;
  createdAt: string;
}

interface PaymentStatus {
  personId: string;
  personName: string;
  customAmount?: number;
  monthlyPayments: {
    [key: string]: { // format: "2025-01"
      isPaid: boolean;
      amount: number;
      paidAt?: string;
    }
  };
  totalDebt: number;
}

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([]);
  const [orphanPayments, setOrphanPayments] = useState<GroupOrphanPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditingAmounts, setIsEditingAmounts] = useState(false);
  const [customAmounts, setCustomAmounts] = useState<{[personId: string]: number}>({});
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Kişilerin grup üyelik tarih aralıkları
  const membershipDates: { [key: string]: Array<{from: {month: number, year: number}, to: {month: number, year: number} | null}> } = {
    // Enes Gündoğan grubu
    'Enes Gündoğan-Enes Gündoğan': [
      { from: { month: 11, year: 2021 }, to: null }
    ],
    'Aykut Kılıç-Enes Gündoğan': [
      { from: { month: 5, year: 2025 }, to: null }
    ],
    
    // Kumanyalar grubu
    'Kerem Kızılboğa-Kumanyalar': [
      { from: { month: 3, year: 2023 }, to: null }
    ],
    'Enes Gündoğan-Kumanyalar': [
      { from: { month: 2, year: 2023 }, to: null }
    ],
    'Nesih Yiğit-Kumanyalar': [
      { from: { month: 2, year: 2023 }, to: null }
    ],
    'Samet Yıldırım-Kumanyalar': [
      { from: { month: 2, year: 2023 }, to: null }
    ],
    'Burak Sarı-Kumanyalar': [
      { from: { month: 2, year: 2023 }, to: null }
    ],
    'Aykut Kılıç-Kumanyalar': [
      { from: { month: 5, year: 2025 }, to: null }
    ],
    
    // Tevfik İleri grubu (database'de "Tevfik ileri" olarak kayıtlı)
    'Bedirhan Uçak-Tevfik ileri': [
      { from: { month: 4, year: 2023 }, to: null }
    ],
    'Zahid Yapıcı-Tevfik ileri': [
      { from: { month: 4, year: 2023 }, to: null }
    ],
    'Fahrettin Özkan-Tevfik ileri': [
      { from: { month: 4, year: 2023 }, to: null }
    ],
    'Faik Burak Çakar-Tevfik ileri': [
      { from: { month: 4, year: 2023 }, to: null }
    ],
    'Emir Balım-Tevfik ileri': [
      { from: { month: 4, year: 2023 }, to: null }
    ],
    'İbrahim Dinçsoy-Tevfik ileri': [
      { from: { month: 4, year: 2023 }, to: null }
    ],
    
    // Siyer Okumaları grubu (database'de "Siyer" olarak kayıtlı)
    'Aykut Kılıç-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Muhammed Denizoğlu-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Ahmet Bera Çakmak-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Ali İhsan Akkaş-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Hafız Talha Kaya-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Muhammed Yılmaz-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Safa Alev-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Çağrı Cengiz-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Burak Sarı-Siyer': [
      { from: { month: 7, year: 2023 }, to: null }
    ],
    'Samet Yıldırım-Siyer': [
      { from: { month: 7, year: 2023 }, to: { month: 6, year: 2024 } }
    ],
    'Enes Gündoğan-Siyer': [
      { from: { month: 7, year: 2023 }, to: { month: 6, year: 2024 } }
    ],
    'Ahmet Selim Akkaş-Siyer': [
      { from: { month: 7, year: 2024 }, to: null }
    ],
    'Emir Yüce-Siyer': [
      { from: { month: 7, year: 2024 }, to: null }
    ],
    'Akif Şentürk-Siyer': [
      { from: { month: 7, year: 2024 }, to: null }
    ],
    
    // Çay Grubu
    'Yusuf Fatih Çevik-Çay Grubu': [
      { from: { month: 11, year: 2023 }, to: null }
    ],
    'Samet Tathan-Çay Grubu': [
      { from: { month: 11, year: 2023 }, to: null }
    ],
    'Yasir Bağcı-Çay Grubu': [
      { from: { month: 11, year: 2023 }, to: null }
    ],
    'Haşim Mert Tuynak-Çay Grubu': [
      { from: { month: 11, year: 2023 }, to: null }
    ],
    'Ercüment Balkan-Çay Grubu': [
      { from: { month: 11, year: 2023 }, to: null }
    ]
  };

  // Get member's current membership periods
  const getMembershipPeriods = (memberName: string): Array<{from: {month: number, year: number}, to: {month: number, year: number} | null}> => {
    const key = `${memberName}-${group?.name || ''}`;
    return membershipDates[key] || [];
  };

  // Handle member edit
  const handleEditMember = (member: GroupMember) => {
    setEditingMember(member);
    setIsEditMemberModalOpen(true);
  };

  // Save member data
  const handleSaveMemberData = async (memberData: {
    customAmount: number;
    isActive: boolean;
    membershipDates: Array<{from: {month: number, year: number}, to: {month: number, year: number} | null}>;
  }) => {
    if (!editingMember || !group) return;

    try {
      // Update custom amount and active status in database
      const response = await fetch(`/api/groups/${groupId}/members/${editingMember.person.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          customAmount: memberData.customAmount,
          isActive: memberData.isActive
        }),
      });

      if (response.ok) {
        // Update membership dates in local state
        const key = `${editingMember.person.name}-${group.name}`;
        membershipDates[key] = memberData.membershipDates;
        
        // Refresh group data and payment statuses
        await fetchGroupDetail();
        
        alert('Üye bilgileri güncellendi');
      } else {
        alert('Üye bilgileri güncellenemedi');
      }
    } catch (err) {
      alert('Bir hata oluştu');
    }
  };
  // Kişinin belirli bir tarihte grup üyesi olup olmadığını kontrol et
  const isPersonInGroupAtDate = (personName: string, groupName: string, month: number, year: number): boolean => {
    const key = `${personName}-${groupName}`;
    const memberships = membershipDates[key];
    
    if (!memberships) {
      // Eğer üyelik verisi yoksa, sadece temmuz 2025 ve sonrası için üye kabul et
      // Temmuz 2025 öncesi dönemler için false döndür (boş kutucuk)
      const checkDate = new Date(year, month - 1, 1);
      const july2025 = new Date(2025, 6, 1); // Temmuz 2025
      
      return checkDate >= july2025;
    }
    
    const currentDate = { month, year };
    
    return memberships.some(membership => {
      // Başlangıç tarihini kontrol et
      const isAfterStart = 
        currentDate.year > membership.from.year ||
        (currentDate.year === membership.from.year && currentDate.month >= membership.from.month);
      
      // Bitiş tarihini kontrol et (null ise hala aktif)
      const isBeforeEnd = membership.to === null || 
        currentDate.year < membership.to.year ||
        (currentDate.year === membership.to.year && currentDate.month <= membership.to.month);
      
      return isAfterStart && isBeforeEnd;
    });
  };

  const handleMarkOrphanPayment = async (month: number, year: number, isPaid: boolean) => {
    if (!group) return;
    
    try {
      const response = await fetch(`/api/groups/${group.id}/orphan-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month,
          year,
          amount: group.totalMonthlyAmount,
          isPaid,
        }),
      });

      if (response.ok) {
        // Yetim ödemelerini yeniden getir
        const updatedData = await fetch(`/api/groups/${groupId}`);
        if (updatedData.ok) {
          const data = await updatedData.json();
          if (data.orphanPayments) {
            setOrphanPayments(data.orphanPayments);
          }
        }
      }
    } catch (err) {
      alert('Yetim ödeme durumu güncellenemedi');
    }
  };

  const fetchPaymentStatuses = (members: GroupMember[]) => {
    const statuses: PaymentStatus[] = [];
    
    // Grup başlangıç tarihini kullan
    const groupStartMonth = group?.startMonth || 1;
    const groupStartYear = group?.startYear || 2021;
    const groupStartDate = new Date(groupStartYear, groupStartMonth - 1, 1);
    const currentDate = new Date();
    
    for (const member of members) {
      const monthlyPayments: { [key: string]: { isPaid: boolean; amount: number; paidAt?: string } } = {};
      let totalDebt = 0;
      
      // Ödeme verilerini işle (artık API'den geldi)
      const payments = member.person.payments || [];
      const paymentMap = new Map();
      payments.forEach(payment => {
        const key = `${payment.year}-${payment.month.toString().padStart(2, '0')}`;
        paymentMap.set(key, payment);
      });
      
      // Grup başlangıç tarihinden bugüne kadar tüm ayları kontrol et
      for (let year = groupStartDate.getFullYear(); year <= currentDate.getFullYear(); year++) {
        const startMonth = year === groupStartDate.getFullYear() ? groupStartDate.getMonth() + 1 : 1;
        const endMonth = year === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
        
        for (let month = startMonth; month <= endMonth; month++) {
          const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
          
          // Kişi bu ay üye mi?
          if (isPersonInGroupAtDate(member.person.name, group?.name || '', month, year)) {
            const payment = paymentMap.get(monthKey);
            
            if (payment) {
              monthlyPayments[monthKey] = {
                isPaid: payment.isPaid,
                amount: payment.amount,
                paidAt: payment.paidAt
              };
              
              if (!payment.isPaid) {
                totalDebt += payment.amount;
              }
            } else {
              // Ödeme yok, borçlu
              const amount = member.customAmount || group?.perPersonFee || 0;
              monthlyPayments[monthKey] = {
                isPaid: false,
                amount: amount
              };
              totalDebt += amount;
            }
          }
        }
      }
      
      statuses.push({
        personId: member.person.id,
        personName: member.person.name,
        customAmount: member.customAmount,
        monthlyPayments,
        totalDebt
      });
    }
    
    setPaymentStatuses(statuses);
  };

  const fetchGroupDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/groups/${groupId}`);
      
      if (!response.ok) {
        throw new Error('Grup detayları getirilemedi');
      }
      
      const data = await response.json();
      setGroup(data);
      
      // Custom amount'ları state'e aktar
      const amounts: {[personId: string]: number} = {};
      data.members.forEach((member: GroupMember) => {
        amounts[member.person.id] = member.customAmount || 0;
      });
      setCustomAmounts(amounts);
      
      // Ödeme durumlarını işle (artık sync)
      fetchPaymentStatuses(data.members);
      
      // Yetim ödemelerini set et (artık API'den geldi)
      if (data.orphanPayments) {
        setOrphanPayments(data.orphanPayments);
      }
      
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Equal distribution handler
  const handleEqualDistribution = () => {
    if (!group || group.members.length === 0) return;

    const perPersonAmount = Math.round((group.totalMonthlyAmount / group.members.length) * 100) / 100;
    
    const updates: {[personId: string]: number} = {};
    group.members.forEach(member => {
      updates[member.person.id] = perPersonAmount;
    });
    
    setCustomAmounts(updates);
    setIsEditingAmounts(true); // Düzenleme modunu aç
  };

  // Save custom amounts
  const handleSaveAmounts = async () => {
    try {
      const updatePromises = Object.entries(customAmounts).map(([personId, amount]) =>
        fetch(`/api/groups/${groupId}/members/${personId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customAmount: amount }),
        })
      );

      await Promise.all(updatePromises);
      setIsEditingAmounts(false);
      await fetchGroupDetail();
    } catch (err) {
      alert('Özel tutarlar kaydedilemedi');
    }
  };

  // Mark payment as paid
  const handleMarkAsPaid = async (personId: string, month: number, year: number) => {
    try {
      const paymentStatus = paymentStatuses.find(p => p.personId === personId);
      const amount = paymentStatus?.customAmount || group?.perPersonFee || 0;

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId,
          amount,
          month,
          year,
          groupId
        }),
      });

      if (response.ok) {
        // Hızlı güncellemek için sadece ilgili veriyi yenile
        await fetchGroupDetail();
      }
    } catch (err) {
      alert('Ödeme kaydedilemedi');
    }
  };

  // Mark payment as unpaid
  const handleMarkAsUnpaid = async (personId: string, month: number, year: number) => {
    try {
      const response = await fetch(`/api/payments?personId=${personId}&month=${month}&year=${year}&groupId=${groupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Hızlı güncellemek için sadece ilgili veriyi yenile
        await fetchGroupDetail();
      }
    } catch (err) {
      alert('Ödeme iptal edilemedi');
    }
  };

  useEffect(() => {
    fetchGroupDetail();
  }, [groupId]);

  // fetchOrphanPayments artık gerekli değil, veriler grup API'si ile gelir

  // Get list of months from group start to current (reversed order - newest first)
  const getMonthsList = () => {
    if (!group) return [];
    
    const startMonth = group.startMonth || 1;
    const startYear = group.startYear || 2021;
    const startDate = new Date(startYear, startMonth - 1, 1);
    const currentDate = new Date();
    
    const months = [];
    
    // Tersten ekle - güncel aydan başlayarak
    for (let year = currentDate.getFullYear(); year >= startDate.getFullYear(); year--) {
      const monthStart = year === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
      const monthEnd = year === startDate.getFullYear() ? startDate.getMonth() + 1 : 1;
      
      for (let month = monthStart; month >= monthEnd; month--) {
        months.push({ month, year });
      }
    }
    
    return months;
  };

  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Grup detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Grup bulunamadı</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const months = getMonthsList();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/gruplar"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
                Gruplara Dön
              </Link>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
            <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{group.members.length} Üye</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{group.orphans.length} Yetim</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Toplam: {formatCurrency(group.totalMonthlyAmount)}</span>
              </div>
              {group.startMonth && group.startYear && (
                <div>
                  <span>Başlangıç: {formatMonth(group.startMonth, group.startYear)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ödeme Yönetimi</h2>
            <div className="flex gap-2">
              <button
                onClick={handleEqualDistribution}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Calculator className="h-4 w-4" />
                Eşit Böl
              </button>
              {isEditingAmounts && (
                <button
                  onClick={handleSaveAmounts}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </button>
              )}
            </div>
          </div>

          {/* Members Payment Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Üye</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Özel Tutar</th>
                  {months.map(({ month, year }) => (
                    <th key={`${year}-${month}`} className="text-center py-3 px-2 font-medium text-gray-900 dark:text-gray-100 min-w-[120px]">
                      {formatMonth(month, year)}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Toplam Borç</th>
                </tr>
              </thead>
              <tbody>
                {group.members.map((member) => {
                  const paymentStatus = paymentStatuses.find(p => p.personId === member.person.id);
                  
                  return (
                    <tr key={member.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{member.person.name}</div>
                          {member.person.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.person.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isEditingAmounts ? (
                          <input
                            type="number"
                            step="0.01"
                            value={customAmounts[member.person.id] || 0}
                            onChange={(e) => setCustomAmounts(prev => ({
                              ...prev,
                              [member.person.id]: parseFloat(e.target.value) || 0
                            }))}
                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(member.customAmount || 0)}
                          </span>
                        )}
                      </td>
                      {months.map(({ month, year }) => {
                        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
                        const payment = paymentStatus?.monthlyPayments[monthKey];
                        
                        // Üyelik kontrolü - kişi bu ay grupta değilse boş hücre göster
                        if (!isPersonInGroupAtDate(member.person.name, group?.name || '', month, year)) {
                          return (
                            <td key={monthKey} className="py-3 px-2 text-center">
                              <div className="text-xs text-gray-300 dark:text-gray-600">-</div>
                            </td>
                          );
                        }
                        
                        return (
                          <td key={monthKey} className="py-3 px-2 text-center">
                            {payment ? (
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => payment.isPaid 
                                    ? handleMarkAsUnpaid(member.person.id, month, year)
                                    : handleMarkAsPaid(member.person.id, month, year)
                                  }
                                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    payment.isPaid 
                                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800' 
                                      : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800'
                                  }`}
                                >
                                  {payment.isPaid ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </button>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {formatCurrency(payment.amount)}
                                </div>
                                {payment.isPaid && payment.paidAt && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(payment.paidAt)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 dark:text-gray-500">-</div>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${
                          (paymentStatus?.totalDebt || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {formatCurrency(paymentStatus?.totalDebt || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Yetim Ödemeleri Satırı */}
                <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                  <td className="py-3 px-4">
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Yetim Ödemeleri
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Aylık Toplam: {formatCurrency(group.totalMonthlyAmount)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {formatCurrency(group.totalMonthlyAmount)}
                    </span>
                  </td>
                  {months.map(({ month, year }) => {
                    const orphanPayment = orphanPayments.find(p => p.month === month && p.year === year);
                    
                    return (
                      <td key={`orphan-${year}-${month}`} className="py-3 px-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleMarkOrphanPayment(month, year, !orphanPayment?.isPaid)}
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              orphanPayment?.isPaid 
                                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800' 
                                : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800'
                            }`}
                          >
                            {orphanPayment?.isPaid ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </button>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {formatCurrency(orphanPayment?.amount || group.totalMonthlyAmount)}
                          </div>
                          {orphanPayment?.isPaid && orphanPayment.paidAt && (
                            <div className="text-xs text-blue-500 dark:text-blue-400">
                              {formatDate(orphanPayment.paidAt)}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Yetim Ödemeleri
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Group Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Grup Üyeleri</h2>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm">
                {group.members.length} Üye
              </span>
            </div>
            <div className="space-y-3">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{member.person.name}</div>
                        {member.person.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{member.person.email}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {member.isActive ? (
                            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">Aktif</span>
                          ) : (
                            <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 px-2 py-1 rounded">Pasif</span>
                          )}
                          {getMembershipPeriods(member.person.name).length > 0 && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                              {getMembershipPeriods(member.person.name).length} dönem
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(member.customAmount || 0)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditMember(member)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Settings className="h-3 w-3" />
                      Düzenle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orphans */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Desteklenen Yetimler</h2>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm">
                {group.orphans.length} Yetim
              </span>
            </div>
            <div className="space-y-3">
              {group.orphans.map((orphanAssignment) => (
                <div
                  key={orphanAssignment.orphan.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{orphanAssignment.orphan.name}</div>
                    {orphanAssignment.orphan.age && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">Yaş: {orphanAssignment.orphan.age}</div>
                    )}
                    {orphanAssignment.orphan.location && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{orphanAssignment.orphan.location}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(orphanAssignment.orphan.monthlyFee)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Member Modal */}
      <EditGroupMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => {
          setIsEditMemberModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        groupName={group.name}
        membershipDates={editingMember ? getMembershipPeriods(editingMember.person.name) : []}
        onSave={handleSaveMemberData}
      />
    </div>
  );
}
