import { FiscalYearPayroll, SchoolInfo, TeacherRecord } from '../types';
import { calculateTeacherPayroll, getMaxGradeForDesignation } from '../utils/calculations';

export const initialSchoolInfo: SchoolInfo = {
  schoolName: 'श्री मंगल सिंह माध्यमिक विद्यालय',
  address: 'सुनवर्षी- १, कैचना, मोरङ',
  municipality: 'सुनवर्षी नगरपालिका',
  district: 'मोरङ',
  province: 'कोशी प्रदेश',
  headmasterName: 'सन्तलाल सोरेन',
  accountantName: 'कृष्ण प्रसाद रिजाल',
  inspectorName: 'विद्यालय व्यवस्थापन समिति अध्यक्ष'
};

const rawTeachers2082: TeacherRecord[] = [
  {
    id: 't-1',
    sn: 1,
    name: 'सन्तलाल सोरेन',
    designation: 'मा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 43689,
    gradeCount: 8,
    gradeRate: 1456,
    gradeAmount: 11648,
    koshThap: 5533.70,
    bimaThap: 400,
    praABhatta: 1500,
    mahangiBhatta: 5000,
    protsahanBhatta: 4368.9,
    anyaBhatta: 0,
    koshKatti: 11067.40,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-2',
    sn: 2,
    name: 'सुमन पोखरेल',
    designation: 'मा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 43689,
    gradeCount: 3,
    gradeRate: 1456,
    gradeAmount: 4368,
    koshThap: 4805.70,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 4368.9,
    anyaBhatta: 300,
    koshKatti: 9611.40,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-3',
    sn: 3,
    name: 'जीत बहादुर राई',
    designation: 'मा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 43689,
    gradeCount: 0,
    gradeRate: 1456,
    gradeAmount: 0,
    koshThap: 4368.90,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 4368.9,
    anyaBhatta: 0,
    // t-3
    koshKatti: 8737.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-4',
    sn: 4,
    name: 'सुरेश कुमार मण्डल',
    designation: 'मा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 43689,
    gradeCount: 0,
    gradeRate: 1456,
    gradeAmount: 0,
    koshThap: 4368.90,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 4368.9,
    anyaBhatta: 0,
    koshKatti: 8737.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-5',
    sn: 5,
    name: 'चिन्तामणी तिमसिरे',
    designation: 'नि.मा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 34730,
    gradeCount: 8,
    gradeRate: 1158,
    gradeAmount: 9264,
    koshThap: 4399.40,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3473,
    anyaBhatta: 0,
    koshKatti: 8798.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-6',
    sn: 6,
    name: 'भरतमान राई',
    designation: 'नि.मा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 34730,
    gradeCount: 7,
    gradeRate: 1158,
    gradeAmount: 8106,
    koshThap: 4283.60,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3473,
    anyaBhatta: 0,
    koshKatti: 8567.20,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-7',
    sn: 7,
    name: 'बुद्ध थापा',
    designation: 'नि.मा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 34730,
    gradeCount: 3,
    gradeRate: 1158,
    gradeAmount: 3474,
    koshThap: 3820.40,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3473,
    anyaBhatta: 255,
    koshKatti: 7640.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-8',
    sn: 8,
    name: 'धर्म राज महतो',
    designation: 'राहत शिक्षक',
    category: 'relief',
    basicSalary: 34730,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3473,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-9',
    sn: 9,
    name: 'बिजय कुमार राजवंशी',
    designation: 'राहत शिक्षक',
    category: 'relief',
    basicSalary: 32902,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3290.2,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-10',
    sn: 10,
    name: 'महेन्द्र प्रसाद चौलागाई',
    designation: 'प्रा.वि. द्वितीय',
    category: 'permanent',
    basicSalary: 34730,
    gradeCount: 8,
    gradeRate: 1158,
    gradeAmount: 9264,
    koshThap: 4399.40,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3473,
    anyaBhatta: 0,
    koshKatti: 8798.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-11',
    sn: 11,
    name: 'बल बहादुर राई',
    designation: 'प्रा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 32902,
    gradeCount: 6,
    gradeRate: 1097,
    gradeAmount: 6582,
    koshThap: 3948.40,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3290.2,
    anyaBhatta: 0,
    koshKatti: 7896.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-12',
    sn: 12,
    name: 'विनोद साह',
    designation: 'प्रा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 32902,
    gradeCount: 6,
    gradeRate: 1097,
    gradeAmount: 6582,
    koshThap: 3948.40,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3290.2,
    anyaBhatta: 0,
    koshKatti: 7896.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-13',
    sn: 13,
    name: 'अमृता पोखरेल',
    designation: 'प्रा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 32902,
    gradeCount: 6,
    gradeRate: 1097,
    gradeAmount: 6582,
    koshThap: 3948.40,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3290.2,
    anyaBhatta: 0,
    koshKatti: 7896.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-14',
    sn: 14,
    name: 'नन्दमाया सुब्बा',
    designation: 'प्रा.वि. तृतीय',
    category: 'permanent',
    basicSalary: 32902,
    gradeCount: 6,
    gradeRate: 1097,
    gradeAmount: 6582,
    koshThap: 3948.40,
    bimaThap: 400,
    praABhatta: 0,
    mahangiBhatta: 5000,
    protsahanBhatta: 3290.2,
    anyaBhatta: 0,
    koshKatti: 7896.80,
    bimaKatti: 800,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-15',
    sn: 15,
    name: 'हरी माया लिम्बु',
    designation: 'बालविकास शिक्षक',
    category: 'contract',
    basicSalary: 17000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-16',
    sn: 16,
    name: 'सपना राई',
    designation: 'बालविकास शिक्षक',
    category: 'contract',
    basicSalary: 17000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-17',
    sn: 17,
    name: 'कृष्ण प्रसाद रिजाल',
    designation: 'लेखापाल',
    category: 'staff',
    basicSalary: 18000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-18',
    sn: 18,
    name: 'कुमारी राई',
    designation: 'का. सहयोगी',
    category: 'staff',
    basicSalary: 17500,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 1000,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-19',
    sn: 19,
    name: 'गंगा माया राई',
    designation: 'का. सहयोगी',
    category: 'staff',
    basicSalary: 17000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-20',
    sn: 20,
    name: 'राधिका कार्की',
    designation: 'स.का.',
    category: 'staff',
    basicSalary: 16000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-21',
    sn: 21,
    name: 'सविन्द्र कुमारी राजवंशी',
    designation: 'स.का.',
    category: 'staff',
    basicSalary: 16000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-22',
    sn: 22,
    name: 'बबिता गुरुगाई',
    designation: 'श्रेणी विहीन',
    category: 'staff',
    basicSalary: 13000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-23',
    sn: 23,
    name: 'असिम राई',
    designation: 'नगर शिक्षक',
    category: 'municipal',
    basicSalary: 17000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  },
  {
    id: 't-24',
    sn: 24,
    name: 'सरस्वती दाहाल',
    designation: 'नगर शिक्षक',
    category: 'municipal',
    basicSalary: 17000,
    gradeCount: 0,
    gradeRate: 0,
    gradeAmount: 0,
    koshThap: 0,
    bimaThap: 0,
    praABhatta: 0,
    mahangiBhatta: 0,
    protsahanBhatta: 0,
    anyaBhatta: 0,
    koshKatti: 0,
    bimaKatti: 0,
    citKatti: 0,
    dashainPoshakBhatta: 0
  }
];

// Calculate full payroll for 2082/83 (Quarterly = 3 months, Shrawan to Asar)
export const initialTeachers2082: TeacherRecord[] = rawTeachers2082.map(t => calculateTeacherPayroll(t, 3, false, {
  includeDashain: true,
  includePoshak: false
}));

// Salary scale & grade rate resolver by Fiscal Year and Designation
export function getYearScaleConfig(fiscalYear: string, designation: string, teacherName?: string): {
  basicSalary: number;
  gradeRate: number;
  maxGrade: number;
} {
  const is2083OrLater = fiscalYear.includes('२०८३') || fiscalYear.includes('2083') || fiscalYear.includes('२०८४') || fiscalYear.includes('2084');
  const d = (designation || '').trim();
  const name = (teacherName || '').trim();

  if (is2083OrLater) {
    // 2083/84 Scaled Salary & Grade Rates (New Rules)
    if (d.includes('मा.वि.') && !d.includes('नि.मा.वि.') && !d.includes('प्रा.वि.')) {
      return { basicSalary: 48058, gradeRate: 1602, maxGrade: 8 };
    }
    if (d.includes('नि.मा.वि.')) {
      return { basicSalary: 38203, gradeRate: 1273, maxGrade: 8 };
    }
    if (d.includes('प्रा.वि.') && (d.includes('द्वितीय') || d.includes('२') || d.includes('2') || d.includes('सकन्ड') || d.includes('second'))) {
      return { basicSalary: 38203, gradeRate: 1273, maxGrade: 8 };
    }
    if (d.includes('प्रा.वि.')) {
      return { basicSalary: 36192, gradeRate: 1206, maxGrade: 6 };
    }
    if (d.includes('राहत')) {
      if (name.includes('धर्म राज') || d.includes('नि.मा.वि.')) {
        return { basicSalary: 38203, gradeRate: 1273, maxGrade: 0 };
      }
      return { basicSalary: 36192, gradeRate: 1206, maxGrade: 0 };
    }
  } else {
    // 2082/83 Scaled Salary & Grade Rates
    if (d.includes('मा.वि.') && !d.includes('नि.मा.वि.') && !d.includes('प्रा.वि.')) {
      return { basicSalary: 43689, gradeRate: 1456, maxGrade: 8 };
    }
    if (d.includes('नि.मा.वि.')) {
      return { basicSalary: 34730, gradeRate: 1158, maxGrade: 8 };
    }
    if (d.includes('प्रा.वि.') && (d.includes('द्वितीय') || d.includes('२') || d.includes('2') || d.includes('सकन्ड') || d.includes('second'))) {
      return { basicSalary: 34730, gradeRate: 1158, maxGrade: 8 };
    }
    if (d.includes('प्रा.वि.')) {
      return { basicSalary: 32902, gradeRate: 1097, maxGrade: 6 };
    }
    if (d.includes('राहत')) {
      if (name.includes('धर्म राज') || d.includes('नि.मा.वि.')) {
        return { basicSalary: 34730, gradeRate: 1158, maxGrade: 0 };
      }
      return { basicSalary: 32902, gradeRate: 1097, maxGrade: 0 };
    }
  }

  // Other staff / default
  if (d.includes('लेखापाल')) return { basicSalary: 18000, gradeRate: 0, maxGrade: 0 };
  if (d.includes('सहयोगी')) return { basicSalary: 17500, gradeRate: 0, maxGrade: 0 };
  if (d.includes('स.का.')) return { basicSalary: 16000, gradeRate: 0, maxGrade: 0 };
  if (d.includes('श्रेणी विहीन')) return { basicSalary: 13000, gradeRate: 0, maxGrade: 0 };
  if (d.includes('नगर शिक्षक')) return { basicSalary: 17000, gradeRate: 0, maxGrade: 0 };
  if (d.includes('बालविकास')) return { basicSalary: 17000, gradeRate: 0, maxGrade: 0 };

  return { basicSalary: 0, gradeRate: 0, maxGrade: 8 };
}

// Generate 2083/84 (New Year from 2083 Shrawan to 2084 Asar: with 2083/84 scale & grade caps)
export const initialTeachers2083: TeacherRecord[] = rawTeachers2082.map(t => {
  const scaleConfig = getYearScaleConfig('२०८३/८४', t.designation, t.name);
  const basicSalary = scaleConfig.basicSalary > 0 ? scaleConfig.basicSalary : t.basicSalary;
  const gradeRate = scaleConfig.gradeRate > 0 ? scaleConfig.gradeRate : (t.gradeRate || Math.round(basicSalary / 30));
  const maxGrade = scaleConfig.maxGrade || getMaxGradeForDesignation(t.designation);

  // Grade increment constraint:
  // "8 grade ni ma vi 8 grade pra vi second 8 grade pravi third 6 grade yo samma hune ko grad bridhhi nagarnu"
  let nextGradeCount = 0;
  if (t.category === 'permanent') {
    if (t.gradeCount >= maxGrade) {
      nextGradeCount = t.gradeCount; // Grade reached maximum legal limit, no increment
    } else {
      nextGradeCount = Math.min(maxGrade, t.gradeCount + 1);
    }
  } else {
    nextGradeCount = 0;
  }

  const gradeAmount = nextGradeCount * gradeRate;
  const koshThap = t.category === 'permanent' ? Math.round((basicSalary + gradeAmount) * 0.10 * 100) / 100 : 0;
  const koshKatti = t.category === 'permanent' ? Math.round((basicSalary + gradeAmount) * 0.20 * 100) / 100 : 0;

  return calculateTeacherPayroll({
    ...t,
    id: t.id.replace('t-', 't-2083-'),
    basicSalary,
    gradeCount: nextGradeCount,
    gradeRate,
    gradeAmount,
    koshThap,
    koshKatti,
    protsahanBhatta: t.category === 'permanent' ? Math.round(basicSalary * 0.10 * 100) / 100 : 0,
  }, 3, true, {
    includeDashain: true,
    includePoshak: false
  });
});

// Generate 2081/82 (Prior Year: with 1 less grade for teachers who had grades > 0)
export const initialTeachers2081: TeacherRecord[] = rawTeachers2082.map(t => {
  const previousGradeCount = t.category === 'permanent' ? Math.max(0, t.gradeCount - 1) : 0;
  const gradeRate = t.gradeRate || (previousGradeCount > 0 ? Math.round(t.basicSalary / 30) : 0);
  const gradeAmount = previousGradeCount * gradeRate;
  
  return calculateTeacherPayroll({
    ...t,
    id: t.id.replace('t-', 't-2081-'),
    gradeCount: previousGradeCount,
    gradeRate,
    gradeAmount,
    protsahanBhatta: t.category === 'permanent' ? Math.round(t.basicSalary * 0.10 * 100) / 100 : 0,
    koshThap: t.category === 'permanent' ? Math.round((t.basicSalary + gradeAmount) * 0.10 * 100) / 100 : 0,
    koshKatti: t.category === 'permanent' ? Math.round((t.basicSalary + gradeAmount) * 0.20 * 100) / 100 : 0,
  }, 3, true);
});

// Generate 2080/81 (Two years prior: with 2 less grades)
export const initialTeachers2080: TeacherRecord[] = rawTeachers2082.map(t => {
  const previousGradeCount = Math.max(0, t.gradeCount - 2);
  const gradeRate = t.gradeRate || (previousGradeCount > 0 ? Math.round(t.basicSalary / 30) : 0);
  const gradeAmount = previousGradeCount * gradeRate;
  
  return calculateTeacherPayroll({
    ...t,
    id: t.id.replace('t-', 't-2080-'),
    gradeCount: previousGradeCount,
    gradeRate,
    gradeAmount,
    koshThap: t.category === 'permanent' ? Math.round((t.basicSalary + gradeAmount) * 0.10 * 100) / 100 : 0,
    koshKatti: t.category === 'permanent' ? Math.round((t.basicSalary + gradeAmount) * 0.20 * 100) / 100 : 0,
  }, 3, true);
});

export const initialFiscalYears: FiscalYearPayroll[] = [
  {
    fiscalYear: '२०८२/८३',
    periodTitle: '२०८२ साल साउन १ देखि २०८३ असार मसान्त सम्मको तलबी भर्पाई',
    monthsCount: 3,
    includeDashain: true,
    includePoshak: false,
    selectedQuarter: 'first',
    teachers: initialTeachers2082,
    notes: 'आ.व. २०८२/८३ (साउन १ - असार मसान्त) को मूल तलबी भर्पाई'
  },
  {
    fiscalYear: '२०८३/८४',
    periodTitle: '२०८३ साल साउन १ देखि २०८४ असार मसान्त सम्मको तलबी भर्पाई',
    monthsCount: 3,
    includeDashain: true,
    includePoshak: false,
    selectedQuarter: 'first',
    teachers: initialTeachers2083,
    notes: 'आ.व. २०८३/८४ (साउन १ - असार मसान्त) नयाँ तलब/ग्रेड समायोजन सहित'
  }
];
