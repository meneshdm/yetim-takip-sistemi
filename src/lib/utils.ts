import { FILE_UPLOAD } from './constants';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Turkish format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Name validation
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

// Amount validation
export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000; // Max 1M TL
};

// Month validation
export const isValidMonth = (month: number): boolean => {
  return month >= 1 && month <= 12;
};

// Year validation
export const isValidYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 2020 && year <= currentYear + 5; // 2020'den günümüzden 5 yıl sonrasına kadar
};

// File validation
export const isValidFileType = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? (FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(extension) : false;
};

export const isValidFileSize = (fileSize: number): boolean => {
  return fileSize <= FILE_UPLOAD.MAX_SIZE;
};

// Age validation
export const isValidAge = (age: number): boolean => {
  return age >= 0 && age <= 30; // Yetim yaş aralığı
};

// Generic validation helper
export const validateRequired = (value: unknown, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} gereklidir`;
  }
  return null;
};

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, ''); // Sadece rakamları bırak
};

// Format helpers
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR');
};

export const getMonthName = (month: number): string => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return months[month - 1] || 'Bilinmeyen';
};
