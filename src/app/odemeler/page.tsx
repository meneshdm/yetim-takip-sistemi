"use client";

import { useState, useEffect } from "react";
import { Plus, CreditCard, Calendar, CheckCircle, XCircle, Loader2, User, Filter } from "lucide-react";
import AuthWrapper from "@/components/AuthWrapper";

interface Payment {
  id: number;
  personId: string;
  personName: string;
  amount: number;
  month: number;
  year: number;
  isPaid: boolean;
  paidAt: string | null;
  description: string | null;
  createdAt: string;
}

interface Person {
  id: string;
  name: string;
}

export default function OdemelerPage() {
  return (
    <AuthWrapper>
      <OdemelerContent />
    </AuthWrapper>
  );
}

function OdemelerContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const months = [
    { value: "1", label: "Ocak" },
    { value: "2", label: "Şubat" },
    { value: "3", label: "Mart" },
    { value: "4", label: "Nisan" },
    { value: "5", label: "Mayıs" },
    { value: "6", label: "Haziran" },
    { value: "7", label: "Temmuz" },
    { value: "8", label: "Ağustos" },
    { value: "9", label: "Eylül" },
    { value: "10", label: "Ekim" },
    { value: "11", label: "Kasım" },
    { value: "12", label: "Aralık" },
  ];

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (selectedPerson) params.append('personId', selectedPerson);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);
      
      const response = await fetch(`/api/payments?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ödemeler yüklenirken hata oluştu');
      }
      
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/people');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Kişiler yüklenirken hata oluştu');
      }
      
      setPeople(data);
    } catch (err) {
      console.error('Kişiler yüklenirken hata:', err);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [selectedPerson, selectedMonth, selectedYear]);

  const handleFilterReset = () => {
    setSelectedPerson("");
    setSelectedMonth("");
    setSelectedYear("");
  };

  const getMonthName = (month: number) => {
    return months.find(m => m.value === month.toString())?.label || month.toString();
  };

  const totalPaidAmount = payments
    .filter(payment => payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalUnpaidAmount = payments
    .filter(payment => !payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const paidPaymentsCount = payments.filter(payment => payment.isPaid).length;
  const unpaidPaymentsCount = payments.filter(payment => !payment.isPaid).length;

  return (
    <div className="space-y-6">
      {/* Başlık ve Filtreler */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ödemeler</h1>
          <p className="text-gray-600 mt-1">
            Ödeme takibi ve geçmişi
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtreler</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kişi
            </label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Kişiler</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ay
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Aylar</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yıl
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Yıllar</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilterReset}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
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
          {/* Ödeme İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {paidPaymentsCount}
                  </div>
                  <div className="text-gray-600">Ödenen</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {unpaidPaymentsCount}
                  </div>
                  <div className="text-gray-600">Ödenmemiş</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalPaidAmount.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-gray-600">Toplam Ödenen</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalUnpaidAmount.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-gray-600">Toplam Borç</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ödemeler Listesi */}
          {payments.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Ödeme Geçmişi ({payments.length} kayıt)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kişi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dönem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ödeme Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Açıklama
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {payment.personName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getMonthName(payment.month)} {payment.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {payment.amount.toLocaleString('tr-TR')} ₺
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.isPaid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.isPaid ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ödendi
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Ödenmedi
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.paidAt || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {payment.description || '-'}
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
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ödeme kaydı bulunamadı
              </h3>
              <p className="text-gray-500 mb-6">
                Seçili filtrelere uygun ödeme kaydı bulunmuyor
              </p>
              <button
                onClick={handleFilterReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
