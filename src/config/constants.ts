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