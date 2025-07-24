// Simple toast notification system
export const toast = {
  success: (message: string) => {
    const toastElement = createToast(message, 'success');
    showToast(toastElement);
  },
  
  error: (message: string) => {
    const toastElement = createToast(message, 'error');
    showToast(toastElement);
  },
  
  warning: (message: string) => {
    const toastElement = createToast(message, 'warning');
    showToast(toastElement);
  },
  
  info: (message: string) => {
    const toastElement = createToast(message, 'info');
    showToast(toastElement);
  }
};

function createToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  const toast = document.createElement('div');
  toast.className = `
    fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium 
    transform transition-all duration-300 ease-in-out translate-x-full opacity-0
    ${type === 'success' ? 'bg-green-600' : ''}
    ${type === 'error' ? 'bg-red-600' : ''}
    ${type === 'warning' ? 'bg-yellow-600' : ''}
    ${type === 'info' ? 'bg-blue-600' : ''}
  `;
  
  toast.textContent = message;
  
  return toast;
}

function showToast(toastElement: HTMLElement) {
  document.body.appendChild(toastElement);
  
  // Animate in
  setTimeout(() => {
    toastElement.classList.remove('translate-x-full', 'opacity-0');
  }, 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    toastElement.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
      }
    }, 300);
  }, 4000);
}
