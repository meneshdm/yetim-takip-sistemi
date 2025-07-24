"use client";

import { useState } from "react";
import { X, Upload, Loader2, FileText } from "lucide-react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orphan: {
    id: number;
    name: string;
  } | null;
}

export function FileUploadModal({ isOpen, onClose, onSuccess, orphan }: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orphan || !selectedFile) return;
    
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('orphanId', orphan.id.toString());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Dosya yüklenemedi');
      }

      // Başarılı
      setSelectedFile(null);
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
      setSelectedFile(null);
      setError("");
      onClose();
    }
  };

  if (!isOpen || !orphan) return null;

  const fileSize = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Dosya Yükle
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

          {/* Yetim Bilgisi */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">
              Dosya Yüklenecek Yetim
            </div>
            <div className="text-lg font-semibold text-blue-900">
              {orphan.name}
            </div>
          </div>

          {/* Dosya Seçimi */}
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Dosya Seç *
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-1 text-xs text-gray-500">
              Desteklenen dosya türleri: PDF, DOC, DOCX, JPG, PNG (Max: 5MB)
            </div>
          </div>

          {/* Seçilen Dosya Bilgisi */}
          {selectedFile && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {fileSize} MB
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
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
              disabled={isLoading || !selectedFile}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Dosya Yükle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
