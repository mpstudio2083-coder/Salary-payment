import { TeacherRecord } from '../types';

/**
 * Returns the legal maximum grade limit according to Nepal Teacher Service Rules:
 * - मा.वि. (Secondary): अधिकतम ८ ग्रेड मात्र
 * - नि.मा.वि. (Lower Secondary): अधिकतम ८ ग्रेड
 * - प्रा.वि. द्वितीय (Primary Second Class): अधिकतम ८ ग्रेड
 * - प्रा.वि. तृतीय (Primary Third Class): अधिकतम ६ ग्रेड
 */
export function getMaxGradeForDesignation(designation?: string): number {
  if (!designation) return 8;
  const d = designation.trim();
  
  // मा.वि. (माध्यमिक विद्यालय)
  if (d.includes('मा.वि.') && !d.includes('नि.मा.वि.') && !d.includes('प्रा.वि.')) {
    return 8;
  }
  // नि.मा.वि. (निम्न माध्यमिक विद्यालय)
  if (d.includes('नि.मा.वि.')) {
    return 8;
  }
  // प्रा.वि. द्वितीय (प्राथमिक तह द्वितीय श्रेणी)
  if (d.includes('प्रा.वि.') && (d.includes('द्वितीय') || d.includes('२') || d.includes('2') || d.includes('सकन्ड') || d.includes('second'))) {
    return 8;
  }
  // प्रा.वि. तृतीय (प्राथमिक तह तृतीय श्रेणी)
  if (d.includes('प्रा.वि.') && (d.includes('तृतीय') || d.includes('३') || d.includes('3') || d.includes('थर्ड') || d.includes('third'))) {
    return 6;
  }
  // Default for general प्रा.वि.
  if (d.includes('प्रा.वि.')) {
    return 6;
  }
  return 8;
}

/**
 * Recalculates all derived fields for a teacher record based on monthsCount
 */
export interface CalculationOptions {
  includeDashain?: boolean; // साउनमा दसैं भत्ता त्रैमासिक जम्मामा समावेश गर्ने
  includePoshak?: boolean; // चैतमा पोशाक भत्ता त्रैमासिक जम्मामा समावेश गर्ने
  months?: number; // पूर्ण महिना (उदा. १)
  days?: number; // दिन (उदा. १७)
  useBaisakhGrade?: boolean; // वैशाख १ देखिको नयाँ ग्रेड प्रयोग गर्ने
  quarter?: 'first' | 'second' | 'third' | 'fourth' | 'yearly' | 'nine_months' | 'three_months';
}

/**
 * Retrieves quarter-specific allowances and CIT deduction for a teacher.
 * Fully supports varying allowances per quarter (shrawan-asoj, kartik-poush, magh-chaitra, baisakh-asar)
 * and period-specific CIT / Kalyan Kosh deductions.
 */
export function getQuarterValues(
  teacher: TeacherRecord,
  quarter?: 'first' | 'second' | 'third' | 'fourth' | 'yearly' | 'nine_months' | 'three_months' | string
) {
  const isPermanent = teacher.category === 'permanent';
  const basic = Number(teacher.basicSalary) || 0;

  // Base fallback values
  let praABhatta = Number(teacher.praABhatta) || 0;
  let mahangiBhatta = Number(teacher.mahangiBhatta) || 0;
  let protsahanBhatta = isPermanent
    ? ((teacher.protsahanBhatta !== undefined && teacher.protsahanBhatta !== null)
        ? Number(teacher.protsahanBhatta)
        : Math.round(basic * 0.10 * 100) / 100)
    : 0;
  let anyaBhatta = Number(teacher.anyaBhatta) || 0;
  let citKatti = Number(teacher.citKatti) || 0;
  let dashainBhatta = Number(teacher.dashainBhatta) || 0;
  let poshakBhatta = Number(teacher.poshakBhatta) || 0;

  const qKey = (quarter === 'first' || quarter === 'second' || quarter === 'third' || quarter === 'fourth')
    ? quarter
    : (quarter === 'three_months' ? 'fourth' : undefined);

  // Fourth Quarter (Baisakh - Asar): Check direct Baisakh-specific fields
  if (qKey === 'fourth') {
    if (teacher.citKattiBaisakh !== undefined && teacher.citKattiBaisakh !== null) {
      citKatti = Number(teacher.citKattiBaisakh) || 0;
    }
    if (teacher.anyaBhattaBaisakh !== undefined && teacher.anyaBhattaBaisakh !== null) {
      anyaBhatta = Number(teacher.anyaBhattaBaisakh) || 0;
    }
    if (teacher.praABhattaBaisakh !== undefined && teacher.praABhattaBaisakh !== null) {
      praABhatta = Number(teacher.praABhattaBaisakh) || 0;
    }
    if (teacher.mahangiBhattaBaisakh !== undefined && teacher.mahangiBhattaBaisakh !== null) {
      mahangiBhatta = Number(teacher.mahangiBhattaBaisakh) || 0;
    }
    if (teacher.protsahanBhattaBaisakh !== undefined && teacher.protsahanBhattaBaisakh !== null && isPermanent) {
      protsahanBhatta = Number(teacher.protsahanBhattaBaisakh) || 0;
    }
  }

  // Check quarterlyDetails structure if configured
  if (qKey && teacher.quarterlyDetails && teacher.quarterlyDetails[qKey]) {
    const qd = teacher.quarterlyDetails[qKey]!;
    if (qd.citKatti !== undefined && qd.citKatti !== null) citKatti = Number(qd.citKatti);
    if (qd.anyaBhatta !== undefined && qd.anyaBhatta !== null) anyaBhatta = Number(qd.anyaBhatta);
    if (qd.praABhatta !== undefined && qd.praABhatta !== null) praABhatta = Number(qd.praABhatta);
    if (qd.mahangiBhatta !== undefined && qd.mahangiBhatta !== null) mahangiBhatta = Number(qd.mahangiBhatta);
    if (qd.protsahanBhatta !== undefined && qd.protsahanBhatta !== null) protsahanBhatta = isPermanent ? Number(qd.protsahanBhatta) : 0;
    if (qd.dashainBhatta !== undefined && qd.dashainBhatta !== null) dashainBhatta = Number(qd.dashainBhatta);
    if (qd.poshakBhatta !== undefined && qd.poshakBhatta !== null) poshakBhatta = Number(qd.poshakBhatta);
  }

  return {
    praABhatta,
    mahangiBhatta,
    protsahanBhatta,
    anyaBhatta,
    citKatti,
    dashainBhatta,
    poshakBhatta
  };
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
  const isPermanent = teacher.category === 'permanent';
  
  // Grade count: User can customize, or auto-calculate based on joining date
  // Enforces legal maximum grade limits (मा.वि. ८, नि.मा.वि. ८, प्रा.वि. २nd ८, प्रा.वि. ३rd ६)
  const maxGradeLimit = getMaxGradeForDesignation(teacher.designation);
  const isBaisakhPeriod = options?.useBaisakhGrade || options?.quarter === 'fourth' || options?.quarter === 'three_months';
  let gradeCount = Number(teacher.gradeCount) || 0;
  if (isBaisakhPeriod) {
    if (teacher.gradeCountBaisakh !== undefined) {
      gradeCount = Math.min(maxGradeLimit, Number(teacher.gradeCountBaisakh));
    } else if (isPermanent) {
      gradeCount = Math.min(maxGradeLimit, (Number(teacher.gradeCount) || 0) + 1);
    }
  } else if (isPermanent || teacher.designation.includes('वि.')) {
    gradeCount = Math.min(maxGradeLimit, gradeCount);
  }
  
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
  if (isPermanent) {
    if (autoComputeFormulas) {
      koshThap = Math.round(basicPlusGrade * 0.10 * 100) / 100;
    } else {
      koshThap = Number(teacher.koshThap) || 0;
    }
  }

  // Bima Thap: स्थायी शिक्षकका लागि मात्र सरकारी थप रू ४००
  let bimaThap = 0;
  if (isPermanent) {
    if (autoComputeFormulas) {
      bimaThap = (teacher.bimaThap === undefined || teacher.bimaThap === 0) ? 400 : Number(teacher.bimaThap);
    } else {
      bimaThap = Number(teacher.bimaThap) || 0;
    }
  } else {
    bimaThap = Number(teacher.bimaThap) || 0;
  }

  // Period / Quarter Specific Allowances and CIT Deduction
  const qValues = getQuarterValues(teacher, options?.quarter);
  const praABhatta = qValues.praABhatta;
  const mahangiBhatta = qValues.mahangiBhatta;
  const protsahanBhatta = qValues.protsahanBhatta;
  const anyaBhatta = qValues.anyaBhatta;
  const citKatti = qValues.citKatti;

  // Monthly Gross Total (एक महिनाको जम्मा)
  const monthlyGross = Math.round((basic + gradeAmount + koshThap + bimaThap + praABhatta + mahangiBhatta + protsahanBhatta + anyaBhatta) * 100) / 100;

  // Festival & Uniform Allowances (दसैं तथा पोशाक भत्ता - म्यानुअल प्रविष्टि प्राथमिकता)
  const standardDashain = (isPermanent || teacher.designation.includes('वि.')) ? basicPlusGrade : 0;
  const standardPoshak = (isPermanent || teacher.designation.includes('वि.')) ? 10000 : 0;

  // १२ महिना (वार्षिक) छनौट गर्दा त्रैमासिकमा इन्ट्री गरिएका दसैं र पोशाक भत्ता स्वतः हिसाबमा आउने
  const is12MonthsOrYearly = monthsCount === 12 || options?.quarter === 'yearly';

  let dashainBhatta = 0;
  if (teacher.dashainBhatta !== undefined && teacher.dashainBhatta !== null) {
    dashainBhatta = Number(teacher.dashainBhatta) || 0;
    if (!is12MonthsOrYearly && options && options.includeDashain === false) {
      dashainBhatta = 0;
    }
  } else if (is12MonthsOrYearly || (options && options.includeDashain)) {
    dashainBhatta = standardDashain;
  }

  let poshakBhatta = 0;
  if (teacher.poshakBhatta !== undefined && teacher.poshakBhatta !== null) {
    poshakBhatta = Number(teacher.poshakBhatta) || 0;
    if (!is12MonthsOrYearly && options && options.includePoshak === false) {
      poshakBhatta = 0;
    }
  } else if (is12MonthsOrYearly || (options && options.includePoshak)) {
    poshakBhatta = standardPoshak;
  }

  // Calculate effective duration (Months and Days support e.g. 1 Month 17 Days)
  let effectiveDurationMonths = monthsCount;
  if (options && options.months !== undefined && options.days !== undefined) {
    effectiveDurationMonths = options.months + (options.days / 30);
  } else if (options?.quarter === 'nine_months') {
    if (teacher.period1Months !== undefined) {
      effectiveDurationMonths = Number(teacher.period1Months) + ((Number(teacher.period1Days) || 0) / 30);
    } else if (teacher.customMonths !== undefined || teacher.customDays !== undefined) {
      const cm = Number(teacher.customMonths) || 0;
      const cd = Number(teacher.customDays) || 0;
      effectiveDurationMonths = Math.min(9, cm) + (cd / 30);
    } else {
      effectiveDurationMonths = 9;
    }
  } else if (options?.quarter === 'three_months' || options?.quarter === 'fourth') {
    if (teacher.period2Months !== undefined) {
      effectiveDurationMonths = Number(teacher.period2Months) + ((Number(teacher.period2Days) || 0) / 30);
    } else if (teacher.customMonths !== undefined || teacher.customDays !== undefined) {
      const cm = Number(teacher.customMonths) || 0;
      const cd = Number(teacher.customDays) || 0;
      if (cm <= 9) {
        effectiveDurationMonths = 0;
      } else {
        effectiveDurationMonths = Math.min(3, cm - 9) + (cd / 30);
      }
    } else {
      effectiveDurationMonths = 3;
    }
  } else if (is12MonthsOrYearly) {
    if (teacher.period1Months !== undefined || teacher.period2Months !== undefined) {
      const p1 = (teacher.period1Months !== undefined ? Number(teacher.period1Months) : 9) + ((Number(teacher.period1Days) || 0) / 30);
      const p2 = (teacher.period2Months !== undefined ? Number(teacher.period2Months) : 3) + ((Number(teacher.period2Days) || 0) / 30);
      effectiveDurationMonths = p1 + p2;
    } else if (teacher.customMonths !== undefined || teacher.customDays !== undefined) {
      effectiveDurationMonths = (Number(teacher.customMonths) || 0) + ((Number(teacher.customDays) || 0) / 30);
    } else {
      effectiveDurationMonths = 12;
    }
  } else if (teacher.customMonths !== undefined || teacher.customDays !== undefined) {
    effectiveDurationMonths = (Number(teacher.customMonths) || 0) + ((Number(teacher.customDays) || 0) / 30);
  }

  // Deductions:
  // Kosh Katti: नियम अनुसार स्थायी शिक्षकका लागि मात्र लागू हुने (२०% = १०% शिक्षक + १०% सरकार)
  let koshKatti = 0;
  if (isPermanent) {
    if (autoComputeFormulas && koshThap > 0) {
      koshKatti = Math.round(basicPlusGrade * 0.20 * 100) / 100;
    } else {
      koshKatti = Number(teacher.koshKatti) || 0;
    }
  }

  // Bima Katti: नियम अनुसार स्थायी शिक्षकका लागि रू ८००
  let bimaKatti = 0;
  if (isPermanent) {
    if (autoComputeFormulas && bimaThap > 0 && (!teacher.bimaKatti || teacher.bimaKatti === 0)) {
      bimaKatti = 800;
    } else {
      bimaKatti = Number(teacher.bimaKatti) || 0;
    }
  } else {
    bimaKatti = Number(teacher.bimaKatti) || 0;
  }

  const otherKatti = Number(teacher.otherKatti) || 0;

  // Monthly Total Deduction (एक महिनाको जम्मा कट्टी)
  const monthlyKatti = Math.round((koshKatti + bimaKatti + citKatti + otherKatti) * 100) / 100;

  let periodGross = 0;
  let periodKatti = 0;

  if (is12MonthsOrYearly) {
    // 12 Months: Sum of all 4 quarters respecting each quarter's unique allowances and CIT
    // Q1 (साउन - असोज, ३ महिना, पुरानाे ग्रेड)
    const q1Val = getQuarterValues(teacher, 'first');
    const q1Gross = basic + gradeAmount + koshThap + bimaThap + q1Val.praABhatta + q1Val.mahangiBhatta + q1Val.protsahanBhatta + q1Val.anyaBhatta;
    const q1Katti = koshKatti + bimaKatti + q1Val.citKatti + otherKatti;

    // Q2 (कात्तिक - पुस, ३ महिना, पुरानाे ग्रेड)
    const q2Val = getQuarterValues(teacher, 'second');
    const q2Gross = basic + gradeAmount + koshThap + bimaThap + q2Val.praABhatta + q2Val.mahangiBhatta + q2Val.protsahanBhatta + q2Val.anyaBhatta;
    const q2Katti = koshKatti + bimaKatti + q2Val.citKatti + otherKatti;

    // Q3 (माघ - चैत, ३ महिना, पुरानाे ग्रेड)
    const q3Val = getQuarterValues(teacher, 'third');
    const q3Gross = basic + gradeAmount + koshThap + bimaThap + q3Val.praABhatta + q3Val.mahangiBhatta + q3Val.protsahanBhatta + q3Val.anyaBhatta;
    const q3Katti = koshKatti + bimaKatti + q3Val.citKatti + otherKatti;

    // Q4 (वैशाख - असार, ३ महिना, नयाँ ग्रेड र वैशाख-असारको फरक सा.क.कोष)
    const q4Val = getQuarterValues(teacher, 'fourth');
    const q4GradeCount = isPermanent
      ? (teacher.gradeCountBaisakh !== undefined
          ? Math.min(maxGradeLimit, Number(teacher.gradeCountBaisakh))
          : Math.min(maxGradeLimit, gradeCount + 1))
      : 0;
    const q4GradeAmount = q4GradeCount * gradeRate;
    const q4BasicPlusGrade = basic + q4GradeAmount;
    const q4KoshThap = isPermanent ? Math.round(q4BasicPlusGrade * 0.10 * 100) / 100 : 0;
    const q4KoshKatti = isPermanent ? Math.round(q4BasicPlusGrade * 0.20 * 100) / 100 : 0;
    const q4Gross = basic + q4GradeAmount + q4KoshThap + bimaThap + q4Val.praABhatta + q4Val.mahangiBhatta + q4Val.protsahanBhatta + q4Val.anyaBhatta;
    const q4Katti = q4KoshKatti + bimaKatti + q4Val.citKatti + otherKatti;

    const p1Factor = (teacher.period1Months !== undefined)
      ? (Number(teacher.period1Months) + ((Number(teacher.period1Days) || 0) / 30)) / 9
      : (effectiveDurationMonths <= 9 ? effectiveDurationMonths / 9 : 1);
    const p2Factor = (teacher.period2Months !== undefined)
      ? (Number(teacher.period2Months) + ((Number(teacher.period2Days) || 0) / 30)) / 3
      : (effectiveDurationMonths <= 9 ? 0 : (effectiveDurationMonths - 9) / 3);

    const q1TotalGross = (q1Gross * 3) * p1Factor;
    const q1TotalKatti = (q1Katti * 3) * p1Factor;
    const q2TotalGross = (q2Gross * 3) * p1Factor;
    const q2TotalKatti = (q2Katti * 3) * p1Factor;
    const q3TotalGross = (q3Gross * 3) * p1Factor;
    const q3TotalKatti = (q3Katti * 3) * p1Factor;

    const q4TotalGross = (q4Gross * 3) * p2Factor;
    const q4TotalKatti = (q4Katti * 3) * p2Factor;

    periodGross = Math.round((q1TotalGross + q2TotalGross + q3TotalGross + q4TotalGross + dashainBhatta + poshakBhatta) * 100) / 100;
    periodKatti = Math.round((q1TotalKatti + q2TotalKatti + q3TotalKatti + q4TotalKatti) * 100) / 100;
  } else {
    // Period Total Deduction (त्रैमासिक / अवधि जम्मा कट्टी)
    periodGross = Math.round(((monthlyGross * effectiveDurationMonths) + dashainBhatta + poshakBhatta) * 100) / 100;
    periodKatti = Math.round((monthlyKatti * effectiveDurationMonths) * 100) / 100;
  }

  // Period Gross Payable (त्रैमासिक पाउने रकम) = Period Gross - Period Deductions
  const periodPayableGross = Math.max(0, Math.round((periodGross - periodKatti) * 100) / 100);

  // Tax (त्रैमासिक १% सामाजिक सुरक्षा कर) = 1% on period payable gross
  let tax1Percent = 0;
  if (periodPayableGross > 0) {
    tax1Percent = Math.round((periodPayableGross * 0.01) * 100) / 100;
  }

  // Period Net Payable (त्रैमासिक खुद पाउने रकम) = Period Payable Gross - Tax
  const periodNet = Math.round((periodPayableGross - tax1Percent) * 100) / 100;

  // Monthly Net Payable (एक महिनाको खुद पाउने - दसैं तथा पोशाक भत्ता बाहेकको नियमित १ महिनाको खुद रकम)
  const monthlyPayableGross = Math.max(0, Math.round((monthlyGross - monthlyKatti) * 100) / 100);
  const monthlyTax1Percent = monthlyPayableGross > 0 ? Math.round(monthlyPayableGross * 0.01 * 100) / 100 : 0;
  const monthlyNet = Math.round((monthlyPayableGross - monthlyTax1Percent) * 100) / 100;

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
    protsahanBhatta,
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
  const result = teachers.reduce(
    (acc, t) => {
      acc.basicSalary += t.basicSalary || 0;
      acc.gradeCount += t.gradeCount || 0;
      acc.gradeAmount += t.gradeAmount || 0;
      acc.koshThap += t.koshThap || 0;
      acc.bimaThap += t.bimaThap || 0;
      acc.praABhatta += t.praABhatta || 0;
      acc.mahangiBhatta += t.mahangiBhatta || 0;
      acc.protsahanBhatta += t.protsahanBhatta || 0;
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
      protsahanBhatta: 0,
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

  // Clean 2-decimal rounding for precision
  for (const key of Object.keys(result) as (keyof typeof result)[]) {
    result[key] = Math.round(result[key] * 100) / 100;
  }

  return result;
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
  const protsahanBhatta = isPermanent
    ? ((teacher.protsahanBhatta !== undefined && teacher.protsahanBhatta !== null)
      ? Number(teacher.protsahanBhatta)
      : Math.round(basic * 0.10 * 100) / 100)
    : 0;
  const anyaBhatta = Number(teacher.anyaBhatta) || 0;
  const allowancesTotal = praABhatta + mahangiBhatta + protsahanBhatta + anyaBhatta;

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
 * Allows custom/individual working duration (months & days) per teacher
 */
export interface GradeSplitTeacherResult {
  teacher: TeacherRecord;
  period1Months: number; // साउन - चैत काम गरेको महिना
  period1Days: number; // साउन - चैत काम गरेको दिन
  period1EffectiveMonths: number; // period1Months + (period1Days / 30)

  period2Months: number; // वैशाख - असार काम गरेको महिना
  period2Days: number; // वैशाख - असार काम गरेको दिन
  period2EffectiveMonths: number; // period2Months + (period2Days / 30)

  totalWorkedMonths: number; // कुल काम गरेको महिना
  durationLabel: string; // e.g. "९ महिना" वा "१ महिना १७ दिन" वा "१२ महिना"

  // Period 1 (Shrawan - Chaitra)
  p1GradeCount: number;
  p1GradeRate: number;
  p1GradeAmount: number;
  p1KoshThap: number;
  p1CitKatti: number;
  p1PraABhatta: number;
  p1MahangiBhatta: number;
  p1ProtsahanBhatta: number;
  p1AnyaBhatta: number;
  p1MonthlyGross: number;
  p1MonthlyKatti: number;
  p1PeriodGross: number;
  p1PeriodKatti: number;

  // Period 2 (Baisakh - Ashad - Grade change and Baisakh-specific CIT/allowances)
  p2GradeCount: number;
  p2GradeRate: number;
  p2GradeAmount: number;
  p2KoshThap: number;
  p2CitKatti: number;
  p2PraABhatta: number;
  p2MahangiBhatta: number;
  p2ProtsahanBhatta: number;
  p2AnyaBhatta: number;
  p2MonthlyGross: number;
  p2MonthlyKatti: number;
  p2PeriodGross: number;
  p2PeriodKatti: number;

  // Manual festival allowances
  dashainBhatta: number;
  poshakBhatta: number;

  // Combined Annual
  annualRegularGross: number;
  annualTotalGross: number;
  annualTotalKatti: number;
  annualPayableGross: number;
  annualTax1Percent: number;
  annualNetPayable: number;
}

export function calculateGradeSplit9_3(
  teacher: TeacherRecord,
  customP1Months?: number,
  customP1Days?: number,
  customP2Months?: number,
  customP2Days?: number
): GradeSplitTeacherResult {
  const basic = Number(teacher.basicSalary) || 0;
  const isPermanent = teacher.category === 'permanent';

  // Determine Period 1 (Shrawan - Chaitra) duration
  let p1Months = 9;
  let p1Days = 0;
  if (customP1Months !== undefined) {
    p1Months = Math.max(0, Number(customP1Months) || 0);
  } else if (teacher.period1Months !== undefined) {
    p1Months = Math.max(0, Number(teacher.period1Months) || 0);
  } else if (teacher.customMonths !== undefined || teacher.customDays !== undefined) {
    const cm = Number(teacher.customMonths) || 0;
    const cd = Number(teacher.customDays) || 0;
    if (cm <= 9) {
      p1Months = cm;
      p1Days = cd;
    } else {
      p1Months = 9;
      p1Days = 0;
    }
  }

  if (customP1Days !== undefined) {
    p1Days = Math.max(0, Number(customP1Days) || 0);
  } else if (teacher.period1Days !== undefined) {
    p1Days = Math.max(0, Number(teacher.period1Days) || 0);
  }

  // Determine Period 2 (Baisakh - Ashad) duration
  let p2Months = 3;
  let p2Days = 0;
  if (customP2Months !== undefined) {
    p2Months = Math.max(0, Number(customP2Months) || 0);
  } else if (teacher.period2Months !== undefined) {
    p2Months = Math.max(0, Number(teacher.period2Months) || 0);
  } else if (teacher.customMonths !== undefined || teacher.customDays !== undefined) {
    const cm = Number(teacher.customMonths) || 0;
    const cd = Number(teacher.customDays) || 0;
    if (cm <= 9) {
      p2Months = 0;
      p2Days = 0;
    } else {
      p2Months = Math.min(3, cm - 9);
      p2Days = cd;
    }
  }

  if (customP2Days !== undefined) {
    p2Days = Math.max(0, Number(customP2Days) || 0);
  } else if (teacher.period2Days !== undefined) {
    p2Days = Math.max(0, Number(teacher.period2Days) || 0);
  }

  const p1EffectiveMonths = Math.max(0, p1Months + (p1Days / 30));
  const p2EffectiveMonths = Math.max(0, p2Months + (p2Days / 30));
  const totalWorkedMonths = Math.round((p1EffectiveMonths + p2EffectiveMonths) * 100) / 100;

  // Format Duration Label (उदा. "१ महिना १७ दिन", "९ महिना", "१२ महिना")
  const totalMonthsInt = Math.floor(p1Months + p2Months);
  const totalDaysInt = Math.round(p1Days + p2Days);
  const extraMonthsFromDays = Math.floor(totalDaysInt / 30);
  const remainingDays = totalDaysInt % 30;
  const finalMonths = totalMonthsInt + extraMonthsFromDays;
  let durationLabel = '';
  if (finalMonths > 0 && remainingDays > 0) {
    durationLabel = `${finalMonths} महिना ${remainingDays} दिन`;
  } else if (finalMonths > 0) {
    durationLabel = `${finalMonths} महिना`;
  } else if (remainingDays > 0) {
    durationLabel = `${remainingDays} दिन`;
  } else {
    durationLabel = '० महिना';
  }

  // Period 1 Grade & Monthly Calculations
  const p1GradeCount = Number(teacher.gradeCount) || 0;
  const p1GradeRate = Number(teacher.gradeRate) || (p1GradeCount > 0 ? Math.round(basic / 30) : 0);
  const p1GradeAmount = p1GradeCount * p1GradeRate;
  const p1BasicPlusGrade = basic + p1GradeAmount;

  const p1KoshThap = isPermanent ? Math.round(p1BasicPlusGrade * 0.10 * 100) / 100 : 0;
  const bimaThap = isPermanent ? (Number(teacher.bimaThap) || 400) : (Number(teacher.bimaThap) || 0);

  // Period 1 (Shrawan - Chaitra) allowances and CIT
  const q1Val = getQuarterValues(teacher, 'first');
  const p1PraABhatta = q1Val.praABhatta;
  const p1MahangiBhatta = q1Val.mahangiBhatta;
  const p1ProtsahanBhatta = q1Val.protsahanBhatta;
  const p1AnyaBhatta = q1Val.anyaBhatta;
  const p1CitKatti = q1Val.citKatti;

  const p1MonthlyGross = Math.round((basic + p1GradeAmount + p1KoshThap + bimaThap + p1PraABhatta + p1MahangiBhatta + p1ProtsahanBhatta + p1AnyaBhatta) * 100) / 100;
  const p1KoshKatti = isPermanent ? Math.round(p1BasicPlusGrade * 0.20 * 100) / 100 : 0;
  const bimaKatti = isPermanent ? (Number(teacher.bimaKatti) || 800) : (Number(teacher.bimaKatti) || 0);
  const otherKatti = Number(teacher.otherKatti) || 0;
  const p1MonthlyKatti = Math.round((p1KoshKatti + bimaKatti + p1CitKatti + otherKatti) * 100) / 100;

  // Period 1 Totals (based on actual worked duration)
  const p1PeriodGross = Math.round(p1MonthlyGross * p1EffectiveMonths * 100) / 100;
  const p1PeriodKatti = Math.round(p1MonthlyKatti * p1EffectiveMonths * 100) / 100;

  // Period 2 Grade: स्थायी शिक्षकको मात्र १ ग्रेड थपिने (अधिकतम ग्रेड सीमा अनुसार), गैर-स्थायीको ०
  const maxGrade = getMaxGradeForDesignation(teacher.designation);
  const p2GradeCount = isPermanent
    ? (teacher.gradeCountBaisakh !== undefined
        ? Math.min(maxGrade, Number(teacher.gradeCountBaisakh))
        : Math.min(maxGrade, p1GradeCount + 1))
    : 0;
  
  const p2GradeRate = p1GradeRate || (p2GradeCount > 0 ? Math.round(basic / 30) : 0);
  const p2GradeAmount = p2GradeCount * p2GradeRate;
  const p2BasicPlusGrade = basic + p2GradeAmount;
  const p2KoshThap = isPermanent ? Math.round(p2BasicPlusGrade * 0.10 * 100) / 100 : 0;
  const p2KoshKatti = isPermanent ? Math.round(p2BasicPlusGrade * 0.20 * 100) / 100 : 0;

  // Period 2 (Baisakh - Ashad) allowances and CIT
  const q4Val = getQuarterValues(teacher, 'fourth');
  const p2PraABhatta = q4Val.praABhatta;
  const p2MahangiBhatta = q4Val.mahangiBhatta;
  const p2ProtsahanBhatta = q4Val.protsahanBhatta;
  const p2AnyaBhatta = q4Val.anyaBhatta;
  const p2CitKatti = q4Val.citKatti;

  const p2MonthlyGross = Math.round((basic + p2GradeAmount + p2KoshThap + bimaThap + p2PraABhatta + p2MahangiBhatta + p2ProtsahanBhatta + p2AnyaBhatta) * 100) / 100;
  const p2MonthlyKatti = Math.round((p2KoshKatti + bimaKatti + p2CitKatti + otherKatti) * 100) / 100;

  // Period 2 Totals (based on actual worked duration)
  const p2PeriodGross = Math.round(p2MonthlyGross * p2EffectiveMonths * 100) / 100;
  const p2PeriodKatti = Math.round(p2MonthlyKatti * p2EffectiveMonths * 100) / 100;

  // Festival allowances (दसैं तथा पोशाक भत्ता)
  let dashainBhatta = 0;
  if (teacher.dashainBhatta !== undefined && teacher.dashainBhatta !== null) {
    dashainBhatta = Number(teacher.dashainBhatta) || 0;
  } else if (p1EffectiveMonths > 0 && (isPermanent || teacher.designation.includes('वि.'))) {
    dashainBhatta = p1BasicPlusGrade;
  }

  let poshakBhatta = 0;
  if (teacher.poshakBhatta !== undefined && teacher.poshakBhatta !== null) {
    poshakBhatta = Number(teacher.poshakBhatta) || 0;
  } else if (p1EffectiveMonths > 0 && (isPermanent || teacher.designation.includes('वि.'))) {
    poshakBhatta = 10000;
  }

  // Combined Annual (calculated accurately based on each teacher's actual working period)
  const annualRegularGross = Math.round((p1PeriodGross + p2PeriodGross) * 100) / 100;
  const annualTotalGross = Math.round((annualRegularGross + dashainBhatta + poshakBhatta) * 100) / 100;
  const annualTotalKatti = Math.round((p1PeriodKatti + p2PeriodKatti) * 100) / 100;
  const annualPayableGross = Math.max(0, Math.round((annualTotalGross - annualTotalKatti) * 100) / 100);
  const annualTax1Percent = annualPayableGross > 0 ? Math.round(annualPayableGross * 0.01 * 100) / 100 : 0;
  const annualNetPayable = Math.round((annualPayableGross - annualTax1Percent) * 100) / 100;

  return {
    teacher,
    period1Months: p1Months,
    period1Days: p1Days,
    period1EffectiveMonths: p1EffectiveMonths,
    period2Months: p2Months,
    period2Days: p2Days,
    period2EffectiveMonths: p2EffectiveMonths,
    totalWorkedMonths,
    durationLabel,
    p1GradeCount,
    p1GradeRate,
    p1GradeAmount,
    p1KoshThap,
    p1CitKatti,
    p1PraABhatta,
    p1MahangiBhatta,
    p1ProtsahanBhatta,
    p1AnyaBhatta,
    p1MonthlyGross,
    p1MonthlyKatti,
    p1PeriodGross,
    p1PeriodKatti,
    p2GradeCount,
    p2GradeRate,
    p2GradeAmount,
    p2KoshThap,
    p2CitKatti,
    p2PraABhatta,
    p2MahangiBhatta,
    p2ProtsahanBhatta,
    p2AnyaBhatta,
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
