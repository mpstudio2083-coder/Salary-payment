import { TeacherRecord } from '../types';

/**
 * Recalculates all derived fields for a teacher record based on monthsCount
 */
export interface CalculationOptions {
  includeDashain?: boolean; // साउनमा दसैं भत्ता त्रैमासिक जम्मामा समावेश गर्ने
  includePoshak?: boolean; // चैतमा पोशाक भत्ता त्रैमासिक जम्मामा समावेश गर्ने
  months?: number; // पूर्ण महिना (उदा. १)
  days?: number; // दिन (उदा. १७)
}

/**
 * Recalculates all derived fields for a teacher record based on monthsCount and allowance options
 */
export function calculateTeacherPayroll(
  teacher: TeacherRecord,
  monthsCount: number = 3,
  autoComputeFormulas: boolean = true,
  options?: CalculationOptions
): TeacherRecord {
  const basic = Number(teacher.basicSalary) || 0;
  const gradeCount = Number(teacher.gradeCount) || 0;
  
  // Grade rate: either provided or calculated as Basic / 30
  let gradeRate = Number(teacher.gradeRate);
  if (autoComputeFormulas && (gradeRate === 0 || isNaN(gradeRate)) && basic > 0 && gradeCount > 0) {
    gradeRate = Math.round(basic / 30);
  } else if (isNaN(gradeRate)) {
    gradeRate = 0;
  }

  // Grade amount = gradeCount * gradeRate
  const gradeAmount = autoComputeFormulas ? gradeCount * gradeRate : (Number(teacher.gradeAmount) || 0);

  const basicPlusGrade = basic + gradeAmount;

  // Kosh Thap (Employee Provident Fund Govt Add)
  // नियम: स्थायी शिक्षकका लागि मात्र लागू हुने (१०%), अस्थायी/राहत/करार/कर्मचारीलाई हुँदैन
  let koshThap = 0;
  if (teacher.category === 'permanent') {
    if (autoComputeFormulas) {
      koshThap = Math.round(basicPlusGrade * 0.10 * 100) / 100;
    } else {
      koshThap = Number(teacher.koshThap) || 0;
    }
  } else {
    // Non-permanent teachers do NOT get Kosh Thap
    koshThap = 0;
  }

  // Bima Thap: स्थायी शिक्षकका लागि मात्र सरकारी थप रू ४००
  let bimaThap = 0;
  if (teacher.category === 'permanent') {
    if (autoComputeFormulas) {
      bimaThap = (teacher.bimaThap === undefined || teacher.bimaThap === 0) ? 400 : Number(teacher.bimaThap);
    } else {
      bimaThap = Number(teacher.bimaThap) || 0;
    }
  } else {
    bimaThap = Number(teacher.bimaThap) || 0;
  }

  const praABhatta = Number(teacher.praABhatta) || 0;
  const mahangiBhatta = Number(teacher.mahangiBhatta) || 0;
  const anyaBhatta = Number(teacher.anyaBhatta) || 0;

  // Monthly Gross Total (एक महिनाको जम्मा)
  const monthlyGross = Math.round((basic + gradeAmount + koshThap + bimaThap + praABhatta + mahangiBhatta + anyaBhatta) * 100) / 100;

  // Festival & Uniform Allowances (दसैं तथा पोशाक भत्ता - म्यानुअल प्रविष्टि प्राथमिकता)
  // Standard defaults for reference if not manually set:
  const standardDashain = (teacher.category === 'permanent' || teacher.designation.includes('वि.')) ? basicPlusGrade : 0;
  const standardPoshak = (teacher.category === 'permanent' || teacher.designation.includes('वि.')) ? 10000 : 0;

  // If user entered a manual amount (even 0), respect it. If options toggle is provided:
  let dashainBhatta = 0;
  if (teacher.dashainBhatta !== undefined && teacher.dashainBhatta !== null) {
    dashainBhatta = Number(teacher.dashainBhatta) || 0;
    // If explicitly turned off via options toggle
    if (options && options.includeDashain === false) {
      dashainBhatta = 0;
    }
  } else if (options && options.includeDashain) {
    dashainBhatta = standardDashain;
  }

  let poshakBhatta = 0;
  if (teacher.poshakBhatta !== undefined && teacher.poshakBhatta !== null) {
    poshakBhatta = Number(teacher.poshakBhatta) || 0;
    // If explicitly turned off via options toggle
    if (options && options.includePoshak === false) {
      poshakBhatta = 0;
    }
  } else if (options && options.includePoshak) {
    poshakBhatta = standardPoshak;
  }

  // Calculate effective duration (Months and Days support e.g. 1 Month 17 Days)
  let effectiveDurationMonths = monthsCount;
  if (options && options.months !== undefined && options.days !== undefined) {
    effectiveDurationMonths = options.months + (options.days / 30);
  } else if (teacher.customMonths !== undefined && teacher.customDays !== undefined) {
    effectiveDurationMonths = teacher.customMonths + (teacher.customDays / 30);
  }

  // Period Gross Total (त्रैमासिक / अवधिको जम्मा = मासिक जम्मा × महिना + दसैं भत्ता + पोशाक भत्ता)
  const periodGross = Math.round(((monthlyGross * effectiveDurationMonths) + dashainBhatta + poshakBhatta) * 100) / 100;

  // Deductions:
  // Kosh Katti: नियम अनुसार स्थायी शिक्षकका लागि मात्र लागू हुने (२०% = १०% शिक्षक + १०% सरकार)
  let koshKatti = 0;
  if (teacher.category === 'permanent') {
    if (autoComputeFormulas && koshThap > 0) {
      koshKatti = Math.round(basicPlusGrade * 0.20 * 100) / 100;
    } else {
      koshKatti = Number(teacher.koshKatti) || 0;
    }
  } else {
    // Non-permanent teachers do NOT have Kosh Katti
    koshKatti = 0;
  }

  // Bima Katti: नियम अनुसार स्थायी शिक्षकका लागि रू ८००
  let bimaKatti = 0;
  if (teacher.category === 'permanent') {
    if (autoComputeFormulas && bimaThap > 0 && (!teacher.bimaKatti || teacher.bimaKatti === 0)) {
      bimaKatti = 800;
    } else {
      bimaKatti = Number(teacher.bimaKatti) || 0;
    }
  } else {
    bimaKatti = Number(teacher.bimaKatti) || 0;
  }

  const citKatti = Number(teacher.citKatti) || 0;
  const otherKatti = Number(teacher.otherKatti) || 0;

  // Monthly Total Deduction (एक महिनाको जम्मा कट्टी)
  const monthlyKatti = Math.round((koshKatti + bimaKatti + citKatti + otherKatti) * 100) / 100;

  // Period Total Deduction (त्रैमासिक / अवधि जम्मा कट्टी)
  const periodKatti = Math.round((monthlyKatti * effectiveDurationMonths) * 100) / 100;

  // Period Gross Payable (त्रैमासिक पाउने रकम) = Period Gross (which already includes Dashain & Poshak) - Period Deductions
  const periodPayableGross = Math.round((periodGross - periodKatti) * 100) / 100;

  // Tax (त्रैमासिक १% सामाजिक सुरक्षा कर) = 1% on period payable gross
  let tax1Percent = 0;
  if (periodPayableGross > 0) {
    tax1Percent = Math.round((periodPayableGross * 0.01) * 100) / 100;
  }

  // Period Net Payable (त्रैमासिक खुद पाउने रकम) = Period Payable Gross - Tax
  const periodNet = Math.round((periodPayableGross - tax1Percent) * 100) / 100;

  // Monthly Net Payable (एक महिनाको खुद पाउने)
  const monthlyNet = effectiveDurationMonths > 0 ? Math.round((periodNet / effectiveDurationMonths) * 100) / 100 : 0;

  return {
    ...teacher,
    basicSalary: basic,
    gradeCount,
    gradeRate,
    gradeAmount,
    koshThap,
    bimaThap,
    praABhatta,
    mahangiBhatta,
    anyaBhatta,
    monthlyGross,
    dashainBhatta,
    poshakBhatta,
    dashainPoshakBhatta: dashainBhatta + poshakBhatta,
    periodGross,
    koshKatti,
    bimaKatti,
    citKatti,
    otherKatti,
    monthlyKatti,
    periodKatti,
    periodPayableGross,
    tax1Percent,
    monthlyNet,
    periodNet
  };
}

/**
 * Compute grand totals for all columns
 */
export function calculateGrandTotals(teachers: TeacherRecord[]) {
  return teachers.reduce(
    (acc, t) => {
      acc.basicSalary += t.basicSalary || 0;
      acc.gradeCount += t.gradeCount || 0;
      acc.gradeAmount += t.gradeAmount || 0;
      acc.koshThap += t.koshThap || 0;
      acc.bimaThap += t.bimaThap || 0;
      acc.praABhatta += t.praABhatta || 0;
      acc.mahangiBhatta += t.mahangiBhatta || 0;
      acc.anyaBhatta += t.anyaBhatta || 0;
      acc.monthlyGross += t.monthlyGross || 0;
      acc.dashainBhatta += t.dashainBhatta || 0;
      acc.poshakBhatta += t.poshakBhatta || 0;
      acc.periodGross += t.periodGross || 0;
      acc.koshKatti += t.koshKatti || 0;
      acc.bimaKatti += t.bimaKatti || 0;
      acc.citKatti += t.citKatti || 0;
      acc.monthlyKatti += t.monthlyKatti || 0;
      acc.periodKatti += t.periodKatti || 0;
      acc.dashainPoshakBhatta += t.dashainPoshakBhatta || 0;
      acc.periodPayableGross += t.periodPayableGross || 0;
      acc.tax1Percent += t.tax1Percent || 0;
      acc.monthlyNet += t.monthlyNet || 0;
      acc.periodNet += t.periodNet || 0;
      return acc;
    },
    {
      basicSalary: 0,
      gradeCount: 0,
      gradeAmount: 0,
      koshThap: 0,
      bimaThap: 0,
      praABhatta: 0,
      mahangiBhatta: 0,
      anyaBhatta: 0,
      monthlyGross: 0,
      dashainBhatta: 0,
      poshakBhatta: 0,
      periodGross: 0,
      koshKatti: 0,
      bimaKatti: 0,
      citKatti: 0,
      monthlyKatti: 0,
      periodKatti: 0,
      dashainPoshakBhatta: 0,
      periodPayableGross: 0,
      tax1Percent: 0,
      monthlyNet: 0,
      periodNet: 0
    }
  );
}

/**
 * Detailed calculation for fractional months and days (उदा. १ महिना १७ दिनको तलब भुक्तानी)
 */
export interface PartialSalaryResult {
  teacher: TeacherRecord;
  months: number;
  days: number;
  totalDaysEquivalent: number; // e.g. 1 month 17 days = 30 + 17 = 47 days
  monthlyGross: number;
  dailyGross: number; // प्रति दिन तलब दर (Monthly Gross / 30)
  
  // Base daily components
  basicSalary: number;
  dailyBasic: number;
  gradeAmount: number;
  dailyGrade: number;
  allowancesTotal: number;
  dailyAllowances: number;
  koshThap: number;
  dailyKoshThap: number;
  bimaThap: number;
  dailyBimaThap: number;

  // Breakdown for months and days
  monthsGross: number; // १ महिनाको जम्मा
  daysGross: number; // १७ दिनको जम्मा
  periodGross: number; // कुल तलब जम्मा

  // Deductions
  monthlyKatti: number;
  dailyKatti: number;
  monthsKatti: number;
  daysKatti: number;
  periodKatti: number;

  // Taxable & Net
  periodPayableGross: number;
  tax1Percent: number;
  periodNet: number;
}

export function calculatePartialSalary(
  teacher: TeacherRecord,
  months: number = 1,
  days: number = 17
): PartialSalaryResult {
  const basic = Number(teacher.basicSalary) || 0;
  const gradeCount = Number(teacher.gradeCount) || 0;
  const gradeRate = Number(teacher.gradeRate) || (gradeCount > 0 ? Math.round(basic / 30) : 0);
  const gradeAmount = Number(teacher.gradeAmount) || (gradeCount * gradeRate);
  const basicPlusGrade = basic + gradeAmount;

  const isPermanent = teacher.category === 'permanent';
  const koshThap = isPermanent ? Math.round(basicPlusGrade * 0.10 * 100) / 100 : 0;
  const bimaThap = isPermanent ? (Number(teacher.bimaThap) || 400) : (Number(teacher.bimaThap) || 0);

  const praABhatta = Number(teacher.praABhatta) || 0;
  const mahangiBhatta = Number(teacher.mahangiBhatta) || 0;
  const anyaBhatta = Number(teacher.anyaBhatta) || 0;
  const allowancesTotal = praABhatta + mahangiBhatta + anyaBhatta;

  const monthlyGross = Math.round((basic + gradeAmount + koshThap + bimaThap + allowancesTotal) * 100) / 100;
  const dailyGross = Math.round((monthlyGross / 30) * 100) / 100;

  const dailyBasic = Math.round((basic / 30) * 100) / 100;
  const dailyGrade = Math.round((gradeAmount / 30) * 100) / 100;
  const dailyAllowances = Math.round((allowancesTotal / 30) * 100) / 100;
  const dailyKoshThap = Math.round((koshThap / 30) * 100) / 100;
  const dailyBimaThap = Math.round((bimaThap / 30) * 100) / 100;

  // Months and Days amounts
  const monthsGross = Math.round(monthlyGross * months * 100) / 100;
  const daysGross = Math.round(dailyGross * days * 100) / 100;
  const periodGross = Math.round((monthsGross + daysGross) * 100) / 100;

  // Deductions
  const koshKatti = isPermanent ? Math.round(basicPlusGrade * 0.20 * 100) / 100 : 0;
  const bimaKatti = isPermanent ? (Number(teacher.bimaKatti) || 800) : (Number(teacher.bimaKatti) || 0);
  const citKatti = Number(teacher.citKatti) || 0;
  const otherKatti = Number(teacher.otherKatti) || 0;

  const monthlyKatti = Math.round((koshKatti + bimaKatti + citKatti + otherKatti) * 100) / 100;
  const dailyKatti = Math.round((monthlyKatti / 30) * 100) / 100;

  const monthsKatti = Math.round(monthlyKatti * months * 100) / 100;
  const daysKatti = Math.round(dailyKatti * days * 100) / 100;
  const periodKatti = Math.round((monthsKatti + daysKatti) * 100) / 100;

  const periodPayableGross = Math.round((periodGross - periodKatti) * 100) / 100;
  const tax1Percent = periodPayableGross > 0 ? Math.round(periodPayableGross * 0.01 * 100) / 100 : 0;
  const periodNet = Math.round((periodPayableGross - tax1Percent) * 100) / 100;

  return {
    teacher,
    months,
    days,
    totalDaysEquivalent: (months * 30) + days,
    monthlyGross,
    dailyGross,
    basicSalary: basic,
    dailyBasic,
    gradeAmount,
    dailyGrade,
    allowancesTotal,
    dailyAllowances,
    koshThap,
    dailyKoshThap,
    bimaThap,
    dailyBimaThap,
    monthsGross,
    daysGross,
    periodGross,
    monthlyKatti,
    dailyKatti,
    monthsKatti,
    daysKatti,
    periodKatti,
    periodPayableGross,
    tax1Percent,
    periodNet
  };
}

/**
 * 9 Months (Shrawan-Chaitra) & 3 Months (Baisakh-Ashad with Grade Increment) Split Calculation
 */
export interface GradeSplitTeacherResult {
  teacher: TeacherRecord;
  period1Months: number; // default 9 (साउन - चैत)
  period2Months: number; // default 3 (वैशाख - असार)

  // Period 1 (Shrawan - Chaitra, 9 months)
  p1GradeCount: number;
  p1GradeRate: number;
  p1GradeAmount: number;
  p1KoshThap: number;
  p1MonthlyGross: number;
  p1MonthlyKatti: number;
  p1PeriodGross: number;
  p1PeriodKatti: number;

  // Period 2 (Baisakh - Ashad, 3 months - Grade change)
  p2GradeCount: number;
  p2GradeRate: number;
  p2GradeAmount: number;
  p2KoshThap: number;
  p2MonthlyGross: number;
  p2MonthlyKatti: number;
  p2PeriodGross: number;
  p2PeriodKatti: number;

  // Manual festival allowances
  dashainBhatta: number;
  poshakBhatta: number;

  // Combined Annual (12 months)
  annualRegularGross: number;
  annualTotalGross: number;
  annualTotalKatti: number;
  annualPayableGross: number;
  annualTax1Percent: number;
  annualNetPayable: number;
}

export function calculateGradeSplit9_3(
  teacher: TeacherRecord,
  period1Months: number = 9,
  period2Months: number = 3
): GradeSplitTeacherResult {
  const basic = Number(teacher.basicSalary) || 0;
  const isPermanent = teacher.category === 'permanent';

  // Period 1 Grade
  const p1GradeCount = Number(teacher.gradeCount) || 0;
  const p1GradeRate = Number(teacher.gradeRate) || (p1GradeCount > 0 ? Math.round(basic / 30) : 0);
  const p1GradeAmount = p1GradeCount * p1GradeRate;
  const p1BasicPlusGrade = basic + p1GradeAmount;

  const p1KoshThap = isPermanent ? Math.round(p1BasicPlusGrade * 0.10 * 100) / 100 : 0;
  const bimaThap = isPermanent ? (Number(teacher.bimaThap) || 400) : 0;
  const praABhatta = Number(teacher.praABhatta) || 0;
  const mahangiBhatta = Number(teacher.mahangiBhatta) || 0;
  const anyaBhatta = Number(teacher.anyaBhatta) || 0;

  const p1MonthlyGross = Math.round((basic + p1GradeAmount + p1KoshThap + bimaThap + praABhatta + mahangiBhatta + anyaBhatta) * 100) / 100;
  const p1KoshKatti = isPermanent ? Math.round(p1BasicPlusGrade * 0.20 * 100) / 100 : 0;
  const bimaKatti = isPermanent ? (Number(teacher.bimaKatti) || 800) : 0;
  const citKatti = Number(teacher.citKatti) || 0;
  const otherKatti = Number(teacher.otherKatti) || 0;
  const p1MonthlyKatti = Math.round((p1KoshKatti + bimaKatti + citKatti + otherKatti) * 100) / 100;

  const p1PeriodGross = Math.round(p1MonthlyGross * period1Months * 100) / 100;
  const p1PeriodKatti = Math.round(p1MonthlyKatti * period1Months * 100) / 100;

  // Period 2 Grade: If teacher.gradeCountBaisakh is specified, use it. Otherwise, permanent gets +1 grade.
  const p2GradeCount = teacher.gradeCountBaisakh !== undefined 
    ? Number(teacher.gradeCountBaisakh) 
    : (isPermanent ? p1GradeCount + 1 : p1GradeCount);
  
  const p2GradeRate = p1GradeRate || Math.round(basic / 30);
  const p2GradeAmount = p2GradeCount * p2GradeRate;
  const p2BasicPlusGrade = basic + p2GradeAmount;

  const p2KoshThap = isPermanent ? Math.round(p2BasicPlusGrade * 0.10 * 100) / 100 : 0;
  const p2MonthlyGross = Math.round((basic + p2GradeAmount + p2KoshThap + bimaThap + praABhatta + mahangiBhatta + anyaBhatta) * 100) / 100;
  const p2KoshKatti = isPermanent ? Math.round(p2BasicPlusGrade * 0.20 * 100) / 100 : 0;
  const p2MonthlyKatti = Math.round((p2KoshKatti + bimaKatti + citKatti + otherKatti) * 100) / 100;

  const p2PeriodGross = Math.round(p2MonthlyGross * period2Months * 100) / 100;
  const p2PeriodKatti = Math.round(p2MonthlyKatti * period2Months * 100) / 100;

  // Manual festival allowances
  const dashainBhatta = Number(teacher.dashainBhatta) || 0;
  const poshakBhatta = Number(teacher.poshakBhatta) || 0;

  // Combined Annual
  const annualRegularGross = Math.round((p1PeriodGross + p2PeriodGross) * 100) / 100;
  const annualTotalGross = Math.round((annualRegularGross + dashainBhatta + poshakBhatta) * 100) / 100;
  const annualTotalKatti = Math.round((p1PeriodKatti + p2PeriodKatti) * 100) / 100;
  const annualPayableGross = Math.round((annualTotalGross - annualTotalKatti) * 100) / 100;
  const annualTax1Percent = annualPayableGross > 0 ? Math.round(annualPayableGross * 0.01 * 100) / 100 : 0;
  const annualNetPayable = Math.round((annualPayableGross - annualTax1Percent) * 100) / 100;

  return {
    teacher,
    period1Months,
    period2Months,
    p1GradeCount,
    p1GradeRate,
    p1GradeAmount,
    p1KoshThap,
    p1MonthlyGross,
    p1MonthlyKatti,
    p1PeriodGross,
    p1PeriodKatti,
    p2GradeCount,
    p2GradeRate,
    p2GradeAmount,
    p2KoshThap,
    p2MonthlyGross,
    p2MonthlyKatti,
    p2PeriodGross,
    p2PeriodKatti,
    dashainBhatta,
    poshakBhatta,
    annualRegularGross,
    annualTotalGross,
    annualTotalKatti,
    annualPayableGross,
    annualTax1Percent,
    annualNetPayable
  };
}
