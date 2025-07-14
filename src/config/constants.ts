import jalali from 'jalali-moment';

export const RIAL_TO_TOMAN_FACTOR = 10;

export interface DayObject {
  year: number;
  month: number;
  day: number;
}

export const toGregorianDate = (day: DayObject): Date => {
  const jalaliDate = jalali.from(`${day.year}-${day.month}-${day.day}`, 'fa','YYYY/MM/DD');
  return jalaliDate.toDate();
};

export const toPersianDate = (date: Date): DayObject => {
  const jalaliDate = jalali(date);
  return {
    year: jalaliDate.jYear(),
    month: jalaliDate.jMonth() + 1,
    day: jalaliDate.jDate()
  };
};

export const CONFIG = {
  GOAL_DEADLINE: {
    min_goal_hours: 0,
    max_goal_hours: 0,
  },
  GOAL_AMOUNT: {
    min_goal_value: 0,
    max_goal_value: 0,
  },
  OTP_TIMEOUT: 0,
  SUPERVISION_TIMEOUT_HOURS: 0,
  GOAL_CREATION_FEE: 0,
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount);
};

export const toRials = (tomanAmount: number): number => {
  return tomanAmount * RIAL_TO_TOMAN_FACTOR;
};

export const toTomans = (rialAmount: number): number => {
  return rialAmount / RIAL_TO_TOMAN_FACTOR;
};

export const isValidIranianMobile = (phone: string): boolean => {
  const pattern = /^(\+98|0)?9\d{9}$/;
  return pattern.test(phone);
};

export const validateDeadline = (date: Date): boolean => {
  const minGoalHours = CONFIG.GOAL_DEADLINE?.min_goal_hours;
  const maxGoalHours = CONFIG.GOAL_DEADLINE?.max_goal_hours;

  if (typeof minGoalHours !== 'number' || typeof maxGoalHours !== 'number' || isNaN(minGoalHours) || isNaN(maxGoalHours)) {
    console.error("Configuration for GOAL_DEADLINE is not properly loaded or is invalid. Cannot validate deadline.");
    return false;
  }

  const now = new Date();
  const iranOffsetMinutes = 3.5 * 60;
  const localOffsetMinutes = now.getTimezoneOffset();
  const utcTime = now.getTime() + (localOffsetMinutes * 60 * 1000);
  const iranCurrentTime = new Date(utcTime + (iranOffsetMinutes * 60 * 1000));

  // Calculate the exact timestamps for min and max allowed deadlines from backend perspective
  const minAllowedBackendTimestamp = iranCurrentTime.getTime() + (minGoalHours * 60 * 60 * 1000);
  const maxAllowedBackendTimestamp = iranCurrentTime.getTime() + (maxGoalHours * 60 * 60 * 1000);

  // Convert the input deadline date to its end-of-day timestamp in Iran time for comparison
  // This mimics the backend's `deadline = time.Date(..., 23, 59, 59, 0, location)`
  const selectedDateEndOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  const selectedDateEndOfDayUtc = new Date(Date.UTC(selectedDateEndOfDay.getFullYear(), selectedDateEndOfDay.getMonth(), selectedDateEndOfDay.getDate(), selectedDateEndOfDay.getHours(), selectedDateEndOfDay.getMinutes(), selectedDateEndOfDay.getSeconds(), selectedDateEndOfDay.getMilliseconds()));
  const selectedDateEndOfDayIranTimestamp = selectedDateEndOfDayUtc.getTime() + (iranOffsetMinutes * 60 * 60 * 1000) - (localOffsetMinutes * 60 * 60 * 1000);

  // The backend condition is `(deadline <= now + MinGoalHours) || (deadline >= now + MaxGoalHours)` is invalid.
  // So, the valid range is `now + MinGoalHours < deadline < now + MaxGoalHours`.
  return selectedDateEndOfDayIranTimestamp > minAllowedBackendTimestamp &&
         selectedDateEndOfDayIranTimestamp < maxAllowedBackendTimestamp;
};

const numberToPersianWords = (amount: number): string => {
  if (amount === 0) {
    return "صفر";
  }

  const units = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];
  const numbers = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
  const tens = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
  const hundreds = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
  const tenToNineteen = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];

  const groupToWords = (group: number): string => {
    if (group === 0) {
      return "";
    }

    let words = "";

    const hundred = Math.floor(group / 100);
    group %= 100;

    const ten = Math.floor(group / 10);
    const unit = group % 10;

    if (hundred > 0) {
      words += hundreds[hundred] + " و ";
    }

    if (ten >= 2) {
      words += tens[ten] + " و ";
      if (unit > 0) {
        words += numbers[unit] + " و ";
      }
    } else if (ten === 1) {
      words += tenToNineteen[unit] + " و ";
    } else if (unit > 0) {
      words += numbers[unit] + " و ";
    }

    return words.replace(/ و $/g, "");
  };

  let words = "";
  let unitIndex = 0;
  while (amount > 0) {
    const group = amount % 1000;
    amount = Math.floor(amount / 1000);

    if (group > 0) {
      const groupWords = groupToWords(group);
      words = groupWords + " " + units[unitIndex] + " و " + words;
    }

    unitIndex++;
  }

  words = words.replace(/ و $/g, "");
  return words;
};

export { numberToPersianWords };
