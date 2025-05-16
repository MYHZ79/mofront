export const CONFIG = {
  GOAL_DEADLINE: {
    MIN_DAYS: 3,
    MAX_DAYS: 60,
  },
  GOAL_AMOUNT: {
    MIN: 100_000, // 100,000 تومان
    MAX: 10_000_000, // 10,000,000 تومان
  },
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount);
};

export const isValidIranianMobile = (phone: string): boolean => {
  const pattern = /^(\+98|0)?9\d{9}$/;
  return pattern.test(phone);
};

export const validateDeadline = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + CONFIG.GOAL_DEADLINE.MIN_DAYS);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + CONFIG.GOAL_DEADLINE.MAX_DAYS);

  return date >= minDate && date <= maxDate;
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
