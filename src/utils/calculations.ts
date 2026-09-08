import { TeacherRecord } from '../types';

/**
 * Recalculates all derived fields for a teacher record based on monthsCount
 */
export interface CalculationOptions {
  includeDashain?: boolean; // साउनमा दसैं भत्ता त्रैमासिक जम्मामा समावेश गर्ने
  includePoshak?: boolean; // चैतमा पोशाक भत्ता त्रैमासिक जम्मामा समावेश गर्ने
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
  // Usually 10% of basic + grade for permanent/qualifying teachers
  let koshThap = Number(teacher.koshThap);
  if (autoComputeFormulas) {
    if (teacher.category === 'permanent' || (teacher.designation.includes('वि.') && basic >= 30000)) {
      koshThap = Math.round(basicPlusGrade * 0.10 * 100) / 100;
    } else if (teacher.koshThap === undefined) {
      koshThap = 0;
    }
  }

  // Bima Thap
  let bimaThap = Number(teacher.bimaThap);
  if (autoComputeFormulas && bimaThap === undefined) {
    if (teacher.category === 'permanent' || teacher.designation.includes('वि.')) {
      bimaThap = 400;
    } else {
      bimaThap = 0;
    }
  }

  const praABhatta = Number(teacher.praABhatta) || 0;
  const mahangiBhatta = Number(teacher.mahangiBhatta) || 0;
  const anyaBhatta = Number(teacher.anyaBhatta) || 0;

  // Monthly Gross Total (एक महिनाको जम्मा)
  const monthlyGross = Math.round((basic + gradeAmount + koshThap + bimaThap + praABhatta + mahangiBhatta + anyaBhatta) * 100) / 100;

  // Festival & Uniform Allowances (दसैं तथा पोशाक भत्ता)
  // Standard Dashain = 1 month (Basic + Grade) for permanent/qualifying staff
  const standardDashain = (teacher.category === 'permanent' || teacher.designation.includes('वि.')) ? basicPlusGrade : 0;
  // Standard Poshak = 10,000 for permanent/qualifying staff
  const standardPoshak = (teacher.category === 'permanent' || teacher.designation.includes('वि.')) ? 10000 : 0;

  // Check if options are provided. If options.includeDashain is specified, respect it.
  const isDashainActive = options ? !!options.includeDashain : (teacher.dashainBhatta !== undefined ? teacher.dashainBhatta > 0 : false);
  const isPoshakActive = options ? !!options.includePoshak : (teacher.poshakBhatta !== undefined ? teacher.poshakBhatta > 0 : false);

  const dashainBhatta = isDashainActive 
    ? (teacher.dashainBhatta !== undefined && teacher.dashainBhatta > 0 ? teacher.dashainBhatta : standardDashain)
    : 0;

  const poshakBhatta = isPoshakActive
    ? (teacher.poshakBhatta !== undefined && teacher.poshakBhatta > 0 ? teacher.poshakBhatta : standardPoshak)
    : 0;

  // Period Gross Total (त्रैमासिक / अवधिको जम्मा = मासिक जम्मा × महिना + दसैं भत्ता + पोशाक भत्ता)
  const periodGross = Math.round(((monthlyGross * monthsCount) + dashainBhatta + poshakBhatta) * 100) / 100;

  // Deductions:
  // Kosh Katti: usually 20% of basic + grade for permanent teachers
  let koshKatti = Number(teacher.koshKatti);
  if (autoComputeFormulas && koshThap > 0) {
    koshKatti = Math.round(basicPlusGrade * 0.20 * 100) / 100;
  } else if (isNaN(koshKatti)) {
    koshKatti = 0;
  }

  // Bima Katti: usually 800 if bimaThap is 400
  let bimaKatti = Number(teacher.bimaKatti);
  if (autoComputeFormulas && bimaThap > 0 && (bimaKatti === 0 || isNaN(bimaKatti))) {
    bimaKatti = 800;
  } else if (isNaN(bimaKatti)) {
    bimaKatti = 0;
  }

  const citKatti = Number(teacher.citKatti) || 0;
  const otherKatti = Number(teacher.otherKatti) || 0;

  // Monthly Total Deduction (एक महिनाको जम्मा कट्टी)
  const monthlyKatti = Math.round((koshKatti + bimaKatti + citKatti + otherKatti) * 100) / 100;

  // Period Total Deduction (त्रैमासिक जम्मा कट्टी)
  const periodKatti = Math.round((monthlyKatti * monthsCount) * 100) / 100;

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
  const monthlyNet = monthsCount > 0 ? Math.round((periodNet / monthsCount) * 100) / 100 : 0;

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
