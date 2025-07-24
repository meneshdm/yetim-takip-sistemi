// API Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Bir hata oluştu',
  NOT_FOUND: 'Kayıt bulunamadı',
  UNAUTHORIZED: 'Yetkisiz erişim',
  VALIDATION_ERROR: 'Geçersiz veri',
  SERVER_ERROR: 'Sunucu hatası',
  
  // Person specific
  PERSON_NOT_FOUND: 'Kişi bulunamadı',
  PERSON_NAME_REQUIRED: 'İsim gereklidir',
  PERSON_EMAIL_EXISTS: 'Bu email adresi zaten kayıtlı',
  
  // Orphan specific  
  ORPHAN_NOT_FOUND: 'Yetim bulunamadı',
  ORPHAN_NAME_REQUIRED: 'Yetim adı gereklidir',
  ORPHAN_MONTHLY_FEE_REQUIRED: 'Geçerli bir aylık ücret giriniz',
  
  // Group specific
  GROUP_NOT_FOUND: 'Grup bulunamadı',
  GROUP_NAME_REQUIRED: 'Grup adı gereklidir',
  
  // Payment specific
  PAYMENT_NOT_FOUND: 'Ödeme bulunamadı',
  PAYMENT_AMOUNT_REQUIRED: 'Geçerli bir tutar giriniz',
  PAYMENT_PERSON_REQUIRED: 'Kişi ID gereklidir',
  
  // File upload specific
  FILE_NOT_SELECTED: 'Dosya seçilmedi',
  FILE_TOO_LARGE: 'Dosya boyutu çok büyük',
  FILE_TYPE_NOT_ALLOWED: 'Bu dosya türü desteklenmiyor'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Başarıyla oluşturuldu',
  UPDATED: 'Başarıyla güncellendi',
  DELETED: 'Başarıyla silindi',
  PAYMENT_MARKED: 'Ödeme başarıyla işaretlendi',
  FILE_UPLOADED: 'Dosya başarıyla yüklendi'
} as const;

// File upload settings
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'] as const,
  UPLOAD_DIR: '/public/uploads'
} as const;

// Date/Month constants
export const MONTHS = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' }
] as const;

// Status badges
export const STATUS_TYPES = {
  CURRENT: 'güncel',
  BEHIND_1_MONTH: '1 ay geride',
  BEHIND_2_MONTHS: '2 ay geride', 
  BEHIND_3_PLUS: '3+ ay geride'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  DASHBOARD: '/api/dashboard',
  PEOPLE: '/api/people',
  GROUPS: '/api/groups',
  ORPHANS: '/api/orphans',
  PAYMENTS: '/api/payments',
  UPLOAD: '/api/upload'
} as const;
