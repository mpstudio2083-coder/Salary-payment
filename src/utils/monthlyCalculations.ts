import { 
  NepaliMonth, 
  NEPALI_MONTHS, 
  SpecialAllowanceSettings, 
  TeacherRecord, 
  MonthlyTeacherPayroll 
} from '../types';

export const DEFAULT_ALLOWANCE_SETTINGS: SpecialAllowanceSettings = {
  dashainMonth: 'साउन', // Shrawan payment as requested
  poshakMonth: 'चैत',   // Chaitra payment as requested
  poshakAmount: 10000   // Standard Nepal Govt Rs. 10,000
};

/**
 * Calculates payroll for a single teacher in a specific Nepali month
 */
export function calculateTeacherMonthly(
  teacher: TeacherRecord,
  month: NepaliMonth,
  settings: SpecialAllowanceSettings = DEFAULT_ALLOWANCE_SETTINGS
): MonthlyTeacherPayroll {
  const basic = Number(teacher.basicSalary) || 0;
  const gradeCount = Number(teacher.gradeCount) || 0;
  const gradeRate = Number(teacher.gradeRate) || (gradeCount > 0 ? Math.round(basic / 30) : 0);
  const gradeAmount = Number(teacher.gradeAmount) || (gradeCount * gradeRate);
  const basicPlusGrade = basic + gradeAmount;

  const koshThap = Number(teacher.koshThap) || 0;
  const bimaThap = Number(teacher.bimaThap) || 0;
  const praABhatta = Number(teacher.praABhatta) || 0;
  const mahangiBhatta = Number(teacher.mahangiBhatta) || 0;
  const anyaBhatta = Number(teacher.anyaBhatta) || 0;

  // Regular monthly gross (नियमित मासिक जम्मा)
  const regularMonthlyGross = Math.round((basic + gradeAmount + koshThap + bimaThap + praABhatta + mahangiBhatta + anyaBhatta) * 100) / 100;

  // Dashain allowance check: Shrawan payment (साउन महिना)
  let dashainBhatta = 0;
  if (month === settings.dashainMonth) {
    if (teacher.category === 'permanent') {
      // 1 month's (Basic + Grade) as per Nepal government festival allowance
      dashainBhatta = basicPlusGrade;
    } else {
      // For contract/staff, usually 1 month basic salary or scale
      dashainBhatta = basic;
    }
  }

  // Poshak (Dress) allowance check: Chaitra payment (चैत महिना)
  let poshakBhatta = 0;
  if (month === settings.poshakMonth) {
    // Standard Rs. 10,000 for government staff
    poshakBhatta = settings.poshakAmount;
  }

  // Total gross for this month (including Dashain or Poshak)
  const totalMonthlyGross = Math.round((regularMonthlyGross + dashainBhatta + poshakBhatta) * 100) / 100;

  // Deductions
  const koshKatti = Number(teacher.koshKatti) || 0;
  const bimaKatti = Number(teacher.bimaKatti) || 0;
  const citKatti = Number(teacher.citKatti) || 0;
  const otherKatti = Number(teacher.otherKatti) || 0;

  const totalMonthlyKatti = Math.round((koshKatti + bimaKatti + citKatti + otherKatti) * 100) / 100;

  // Taxable and Net calculation
  // Gross payable = total gross - deductions
  const taxableAmount = Math.max(0, Math.round((totalMonthlyGross - totalMonthlyKatti) * 100) / 100);

  // 1% tax on taxable amount
  const tax1Percent = Math.round((taxableAmount * 0.01) * 100) / 100;

  // Net payable for this month
  const netPayable = Math.round((taxableAmount - tax1Percent) * 100) / 100;

  return {
    teacherId: teacher.id,
    sn: teacher.sn,
    name: teacher.name,
    designation: teacher.designation,
    category: teacher.category,
    basicSalary: basic,
    gradeCount,
    gradeRate,
    gradeAmount,
    koshThap,
    bimaThap,
    praABhatta,
    mahangiBhatta,
    anyaBhatta,
    dashainBhatta,
    poshakBhatta,
    regularMonthlyGross,
    totalMonthlyGross,
    koshKatti,
    bimaKatti,
    citKatti,
    otherKatti,
    totalMonthlyKatti,
    taxableAmount,
    tax1Percent,
    netPayable
  };
}

/**
 * Calculates monthly payroll for all teachers in a specific month
 */
export function calculateAllTeachersForMonth(
  teachers: TeacherRecord[],
  month: NepaliMonth,
  settings: SpecialAllowanceSettings = DEFAULT_ALLOWANCE_SETTINGS
): MonthlyTeacherPayroll[] {
  return teachers.map((t) => calculateTeacherMonthly(t, month, settings));
}

/**
 * Totals for a single month across all teachers
 */
export function calculateMonthlyTotals(monthlyList: MonthlyTeacherPayroll[]) {
  return monthlyList.reduce(
    (acc, m) => {
      acc.basicSalary += m.basicSalary;
      acc.gradeAmount += m.gradeAmount;
      acc.koshThap += m.koshThap;
      acc.bimaThap += m.bimaThap;
      acc.praABhatta += m.praABhatta;
      acc.mahangiBhatta += m.mahangiBhatta;
      acc.anyaBhatta += m.anyaBhatta;
      acc.dashainBhatta += m.dashainBhatta;
      acc.poshakBhatta += m.poshakBhatta;
      acc.regularMonthlyGross += m.regularMonthlyGross;
      acc.totalMonthlyGross += m.totalMonthlyGross;
      acc.koshKatti += m.koshKatti;
      acc.bimaKatti += m.bimaKatti;
      acc.citKatti += m.citKatti;
      acc.totalMonthlyKatti += m.totalMonthlyKatti;
      acc.tax1Percent += m.tax1Percent;
      acc.netPayable += m.netPayable;
      return acc;
    },
    {
      basicSalary: 0,
      gradeAmount: 0,
      koshThap: 0,
      bimaThap: 0,
      praABhatta: 0,
      mahangiBhatta: 0,
      anyaBhatta: 0,
      dashainBhatta: 0,
      poshakBhatta: 0,
      regularMonthlyGross: 0,
      totalMonthlyGross: 0,
      koshKatti: 0,
      bimaKatti: 0,
      citKatti: 0,
      totalMonthlyKatti: 0,
      tax1Percent: 0,
      netPayable: 0
    }
  );
}

/**
 * Summary for all 12 months for the school
 */
export interface MonthSummary {
  month: NepaliMonth;
  isDashainMonth: boolean;
  isPoshakMonth: boolean;
  regularGross: number;
  dashainTotal: number;
  poshakTotal: number;
  totalGross: number;
  totalDeductions: number;
  totalTax: number;
  totalNet: number;
}

export function generateAnnualMonthsSummary(
  teachers: TeacherRecord[],
  settings: SpecialAllowanceSettings = DEFAULT_ALLOWANCE_SETTINGS
): MonthSummary[] {
  return NEPALI_MONTHS.map((month) => {
    const records = calculateAllTeachersForMonth(teachers, month, settings);
    const totals = calculateMonthlyTotals(records);

    return {
      month,
      isDashainMonth: month === settings.dashainMonth,
      isPoshakMonth: month === settings.poshakMonth,
      regularGross: totals.regularMonthlyGross,
      dashainTotal: totals.dashainBhatta,
      poshakTotal: totals.poshakBhatta,
      totalGross: totals.totalMonthlyGross,
      totalDeductions: totals.totalMonthlyKatti,
      totalTax: totals.tax1Percent,
      totalNet: totals.netPayable
    };
  });
}
