export interface BookingSettings {
  availableDays: number[]; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  availableTimes: string[]; // 24-hour format array e.g. ['09:00', '10:00', ...]
}

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  availableDays: [0, 1, 2, 3, 4, 6], // All days except Friday by default
  availableTimes: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
};

export const ALL_POSSIBLE_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const DAYS_NAMES = [
  { id: 0, ar: 'الأحد', en: 'Sunday' },
  { id: 1, ar: 'الإثنين', en: 'Monday' },
  { id: 2, ar: 'الثلاثاء', en: 'Tuesday' },
  { id: 3, ar: 'الأربعاء', en: 'Wednesday' },
  { id: 4, ar: 'الخميس', en: 'Thursday' },
  { id: 5, ar: 'الجمعة', en: 'Friday' },
  { id: 6, ar: 'السبت', en: 'Saturday' },
];

export function formatTime12h(time24: string, isAr: boolean): string {
  if (!time24) return '';
  const cleanTime = time24.slice(0, 5);
  const [hStr, mStr] = cleanTime.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  
  const isPM = h >= 12;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  
  const formattedH = String(h).padStart(2, '0');
  if (isAr) {
    return `${formattedH}:${m} ${isPM ? 'م' : 'ص'}`;
  }
  return `${formattedH}:${m} ${isPM ? 'PM' : 'AM'}`;
}

export function getBookingSettings(): BookingSettings {
  if (typeof window === 'undefined') return DEFAULT_BOOKING_SETTINGS;
  try {
    const saved = localStorage.getItem('crystal_booking_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.availableDays) && Array.isArray(parsed.availableTimes)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading booking settings', e);
  }
  return DEFAULT_BOOKING_SETTINGS;
}

export function saveBookingSettings(settings: BookingSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('crystal_booking_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('booking_settings_updated'));
  } catch (e) {
    console.error('Error saving booking settings', e);
  }
}
