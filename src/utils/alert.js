import Swal from 'sweetalert2';

// การตั้งค่าเริ่มต้นให้ SweetAlert2 ดูมินิมอล เข้ากับเว็บ
const MinimalSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border-2 border-white dark:border-slate-700 shadow-xl dark:bg-slate-800',
    title: 'text-xl font-bold text-slate-800 dark:text-white',
    htmlContainer: 'text-slate-500 dark:text-slate-300 text-sm font-medium',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors mx-2',
    cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold py-2.5 px-6 rounded-xl transition-colors mx-2'
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate-fade-in-up'
  },
  hideClass: {
    popup: 'animate-fade-out-down'
  }
});

export const confirmLogout = async () => {
  const result = await MinimalSwal.fire({
    title: 'ออกจากระบบ?',
    text: 'คุณแน่ใจหรือไม่ที่จะออกจากระบบในตอนนี้',
    icon: 'question',
    iconColor: '#ec4899', // pink-500
    showCancelButton: true,
    confirmButtonText: 'ออกจากระบบ',
    cancelButtonText: 'ยกเลิก',
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const showSuccess = (title, text = '') => {
  return MinimalSwal.fire({
    title,
    text,
    icon: 'success',
    iconColor: '#10b981', // emerald-500
    confirmButtonText: 'ตกลง',
  });
};

export const showError = (title, text = '') => {
  return MinimalSwal.fire({
    title,
    text,
    icon: 'error',
    iconColor: '#ef4444', // red-500
    confirmButtonText: 'ตกลง',
  });
};

export const confirmAction = async (title, text, confirmText = 'ยืนยัน', isDanger = false) => {
  const result = await MinimalSwal.fire({
    title,
    text,
    icon: 'warning',
    iconColor: isDanger ? '#ef4444' : '#3b82f6',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'ยกเลิก',
    reverseButtons: true,
    customClass: {
      ...MinimalSwal.options.customClass,
      confirmButton: isDanger 
        ? 'bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors mx-2'
        : MinimalSwal.options.customClass.confirmButton
    }
  });
  return result.isConfirmed;
};
