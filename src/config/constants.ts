export const CONFIG = {
  GOAL_DEADLINE: {
    min_goal_hours: 72, // Default to 3 days * 24 hours
    max_goal_hours: 1440, // Default to 60 days * 24 hours
  },
  GOAL_AMOUNT: {
    min_goal_value: 100_000, // Default
    max_goal_value: 10_000_000, // Default
  },
  OTP_TIMEOUT: 120, // Default
  SUPERVISION_TIMEOUT_HOURS: 24, // Default
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount);
};

export const isValidIranianMobile = (phone: string): boolean => {
  const pattern = /^(\+98|0)?9\d{9}$/;
  return pattern.test(phone);
};

export const validateDeadline = (date: Date): boolean => {
  const minGoalHours = CONFIG.GOAL_DEADLINE?.min_goal_hours;
  const maxGoalHours = CONFIG.GOAL_DEADLINE?.max_goal_hours;

  // If config values are not properly loaded or are invalid, return false
  if (typeof minGoalHours !== 'number' || typeof maxGoalHours !== 'number' || isNaN(minGoalHours) || isNaN(maxGoalHours)) {
    console.error("Configuration for GOAL_DEADLINE is not properly loaded or is invalid. Cannot validate deadline.");
    return false;
  }

  // Get current UTC time
  const nowUtc = new Date();

  // Create the deadline date at 23:59:59 UTC of the selected day
  // This aligns with the backend's "end of day" logic for the deadline itself,
  // but performed in UTC to avoid client timezone discrepancies.
  const deadlineEndOfDayUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));

  // Calculate min and max allowed timestamps based on current UTC time + config hours
  const minAllowedTimestampUtc = nowUtc.getTime() + minGoalHours * 60 * 60 * 1000;
  const maxAllowedTimestampUtc = nowUtc.getTime() + maxGoalHours * 60 * 60 * 1000;

  // Backend logic: (deadline <= minAllowed) OR (deadline >= maxAllowed) is INVALID
  // So, VALID is: minAllowed < deadline < maxAllowed
  // Compare timestamps in UTC
  return deadlineEndOfDayUtc.getTime() > minAllowedTimestampUtc &&
         deadlineEndOfDayUtc.getTime() < maxAllowedTimestampUtc;
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
