"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

interface AddOrphanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddOrphanModal({ isOpen, onClose, onSuccess }: AddOrphanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
    monthlyFee: "",
    description: ""
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedPhoto(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Lütfen sadece resim dosyası seçin');
      }
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let photoUrl = '';
      
      // Önce fotoğraf varsa upload et
      if (selectedPhoto) {
        const photoFormData = new FormData();
        photoFormData.append('file', selectedPhoto);
        photoFormData.append('type', 'orphan-photo');
        
        const photoResponse = await fetch('/api/upload', {
          method: 'POST',
          body: photoFormData,
        });
        
        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          photoUrl = photoData.url;
        }
      }

      // Yetim kaydını oluştur
      const response = await fetch('/api/orphans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          monthlyFee: parseFloat(formData.monthlyFee),
          photo: photoUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      // Başarılı
      setFormData({ name: "", age: "", location: "", monthlyFee: "", description: "" });
      setSelectedPhoto(null);
      setPhotoPreview(null);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: "", age: "", location: "", monthlyFee: "", description: "" });
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Yeni Yetim Ekle
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* İsim */}
            <div>
              <label htmlFor="orphanName" className="block text-sm font-medium text-gray-700 mb-2">
                İsim Soyisim *
              </label>
              <input
                id="orphanName"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Örn: Zeynep Aslan"
                disabled={isLoading}
              />
            </div>

            {/* Fotoğraf */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotoğraf
              </label>
              <div className="space-y-3">
                {!photoPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="orphan-photo"
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor="orphan-photo" 
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="h-6 w-6 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-500">Fotoğraf Seç</span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Yetim fotoğrafı" 
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Yaş */}
            <div>
              <label htmlFor="orphanAge" className="block text-sm font-medium text-gray-700 mb-2">
                Yaş
              </label>
              <input
                id="orphanAge"
                type="number"
                min="1"
                max="18"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Örn: 8"
                disabled={isLoading}
              />
            </div>

            {/* Konum */}
            <div>
              <label htmlFor="orphanLocation" className="block text-sm font-medium text-gray-700 mb-2">
                Yaşadığı Yer
              </label>
              <input
                id="orphanLocation"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Örn: Ankara"
                disabled={isLoading}
              />
            </div>

            {/* Aylık Ücret */}
            <div>
              <label htmlFor="orphanFee" className="block text-sm font-medium text-gray-700 mb-2">
                Aylık Ücret (₺) *
              </label>
              <input
                id="orphanFee"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Örn: 1500"
                disabled={isLoading}
              />
            </div>

            {/* Açıklama */}
            <div>
              <label htmlFor="orphanDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="orphanDescription"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Yetim hakkında açıklama..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.monthlyFee}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Yetim Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
