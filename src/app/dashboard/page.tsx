"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, Heart, AlertCircle, Loader2 } from "lucide-react";
import AuthWrapper from "@/components/AuthWrapper";

interface DashboardData {
  stats: {
    totalGroups: number;
    totalPeople: number;
    totalOrphans: number;
  };
  balance: {
    current: number;
    monthlyIncome: number;
    monthlyExpense: number;
    totalDebt: number;
    monthlyChange: number;
  };
  debtors: Array<{
    id: string;
    name: string;
    amount: number;
    month: string;
  }>;
}

function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Dashboard verileri getirilemedi');
      }
      
      const data = await response.json();
      setDashboardData(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkAsPaid = async (personId: string, amount: number) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId,
          amount,
          description: 'Temmuz ayı ödemesi'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ödeme işaretlenemedi');
      }

      // Dashboard verilerini yenile
      fetchDashboardData();
      alert('Ödeme başarıyla işaretlendi!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ödeme işaretlenemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          {error || 'Veri yüklenemedi'}
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const { stats, balance, debtors } = dashboardData;

  const istatistikler = [
    {
      title: "Toplam Gruplar",
      value: stats.totalGroups.toString(),
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Aktif Yetimler", 
      value: stats.totalOrphans.toString(),
      icon: Heart,
      color: "text-red-600"
    },
    {
      title: "Kayıtlı Kişiler",
      value: stats.totalPeople.toString(),
      icon: Users,
      color: "text-green-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Yetim Takip Sistemi
          </h1>
          <button
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            title="Verileri Yenile"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-gray-600">
          Güncel kasa durumu ve aylık borç takibi
        </p>
      </div>

      {/* Kasa Durumu Kartı */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Güncel Kasa Durumu
          </h2>
          <div className={`flex items-center space-x-1 ${
            balance.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {balance.monthlyChange >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="font-medium">
              {balance.monthlyChange >= 0 ? '+' : ''}
              {balance.monthlyChange.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {balance.current.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-gray-600">Mevcut Bakiye</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600 mb-1">
              {balance.monthlyIncome.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-gray-600">Bu Ay Gelir</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600 mb-1">
              {balance.monthlyExpense.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-gray-600">Toplam Bağış</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-semibold text-orange-600 mb-1">
              {balance.totalDebt.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-gray-600">Toplam Borç</div>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {istatistikler.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Icon className={`h-8 w-8 ${stat.color} mr-3`} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.title}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borçlular Listesi */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Bu Ay Borcu Olanlar
            </h2>
          </div>

          {debtors.length > 0 ? (
            <div className="space-y-3">
              {debtors.map((kisi) => (
                <div key={kisi.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <div className="font-medium text-gray-900">{kisi.name}</div>
                    <div className="text-sm text-gray-600">{kisi.month} ayı borcu</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-red-600">
                      {kisi.amount.toLocaleString('tr-TR')} ₺
                    </span>
                    <button 
                      onClick={() => handleMarkAsPaid(kisi.id, kisi.amount)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Ödendi İşaretle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Bu ay borcu olan kimse yok! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthWrapper>
      <DashboardContent />
    </AuthWrapper>
  );
}
