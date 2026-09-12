export interface TeacherRecord {
  id: string;
  sn: number;
  name: string; // शिक्षकको नाम
  designation: string; // पद / श्रेणी (e.g. मा.वि. तृतीय, प्रा.वि. तृतीय, लेखापाल)
  category: 'permanent' | 'contract' | 'relief' | 'municipal' | 'staff'; // शिक्षकको प्रकार
  basicSalary: number; // तलब स्केल
  gradeCount: number; // ग्रेड संख्या
  gradeRate: number; // ग्रेड दर (usually basicSalary / 30)
  gradeAmount: number; // ग्रेड रकम (gradeCount * gradeRate)
  koshThap: number; // क. कोष थप (10% of basic + grade)
  bimaThap: number; // बिमा थप (usually 400)
  praABhatta: number; // प्र.अ. भत्ता
  mahangiBhatta: number; // महँगी भत्ता (usually 5000)
  protsahanBhatta?: number; // प्रोत्साहन भत्ता
  anyaBhatta: number; // अन्य भत्ता
  
  // Deductions (कट्टी रकम)
  koshKatti: number; // क. कोष कट्टी (usually 20% of basic + grade)
  bimaKatti: number; // बिमा कट्टी (usually 800)
  citKatti: number; // सा. क. कोष / ना. ल. कोष कट्टी
  otherKatti?: number; // अन्य कट्टी
  
  // Extra / Festival Allowances (दसैं तथा पोशाक भत्ता - म्यानुअल प्रविष्टि)
  dashainBhatta?: number; // दसैं भत्ता (म्यानुअल प्रविष्टि - साउन भुक्तानी)
  poshakBhatta?: number; // पोशाक भत्ता (म्यानुअल प्रविष्टि - चैत भुक्तानी)
  dashainPoshakBhatta?: number; // legacy backwards compatibility

  // Baisakh Grade Change (साउन-चैत ९ महिना र वैशाख-असार ३ महिना ग्रेड विभाजन)
  gradeCountBaisakh?: number; // वैशाख १ देखिको नयाँ ग्रेड संख्या
  gradeAmountBaisakh?: number; // वैशाख १ देखिको नयाँ ग्रेड रकम

  // Partial Month & Days payment fields (उदा. १ महिना १७ दिन)
  customMonths?: number; // e.g. 1
  customDays?: number; // e.g. 17
  customDurationLabel?: string; // e.g. "१ महिना १७ दिन"

  // Period 1 (साउन-चैत) and Period 2 (वैशाख-असार) working duration (कति महिना र दिन काम गरेको)
  period1Months?: number; // अवधि १ (साउन-चैत) काम गरेको महिना (default 9 वा custom)
  period1Days?: number; // अवधि १ (साउन-चैत) काम गरेको दिन (default 0 वा custom)
  period2Months?: number; // अवधि २ (वैशाख-असार) काम गरेको महिना (default 3 वा custom)
  period2Days?: number; // अवधि २ (वैशाख-असार) काम गरेको दिन (default 0 वा custom)
  
  // Computed fields (can be auto-calculated or stored)
  monthlyGross?: number; // एक महिनाको जम्मा
  periodGross?: number; // त्रैमासिक / अवधिको जम्मा
  monthlyKatti?: number; // एक महिनाको जम्मा कट्टी
  periodKatti?: number; // त्रैमासिक जम्मा कट्टी
  periodPayableGross?: number; // त्रैमासिक पाउने रकम
  tax1Percent?: number; // त्रैमासिक १% कर
  monthlyNet?: number; // एक महिनाको खुद पाउने
  periodNet?: number; // त्रैमासिक खुद पाउने रकम
  
  signature?: string; // दस्तखत स्थिति
  remarks?: string; // कैफियत
  isHidden?: boolean; // शिक्षकको नाम अस्थायी रूपमा लुकाउने (आवश्यकता अनुसार hide/show)
}

export interface PayrollPeriod {
  id: string;
  name: string; // e.g. 'त्रैमासिक (बैशाख - असार)', 'प्रथम त्रैमासिक (साउन - असोज)'
  monthsCount: number; // e.g. 3 for trimasik, 1 for monthly, 4 for chaumasik, 12 for yearly
  startMonth: string; // e.g. 'बैशाख'
  endMonth: string; // e.g. 'असार'
  includeDashain: boolean; // दसैं भत्ता समावेश गर्ने वा नगर्ने
  includePoshak: boolean; // पोशाक भत्ता समावेश गर्ने वा नगर्ने
}

export type NepaliMonth = 
  | 'वैशाख' 
  | 'जेठ' 
  | 'असार' 
  | 'साउन' 
  | 'भदौ' 
  | 'असोज' 
  | 'कात्तिक' 
  | 'मङ्सिर' 
  | 'पुस' 
  | 'माघ' 
  | 'फागुन' 
  | 'चैत';

export const NEPALI_MONTHS: NepaliMonth[] = [
  'वैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कात्तिक',
  'मङ्सिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत'
];

export interface SpecialAllowanceSettings {
  dashainMonth: NepaliMonth; // default 'साउन' as requested
  poshakMonth: NepaliMonth; // default 'चैत' as requested
  poshakAmount: number; // default 10000
}

export interface MonthlyTeacherPayroll {
  teacherId: string;
  sn: number;
  name: string;
  designation: string;
  category: string;
  basicSalary: number;
  gradeCount: number;
  gradeRate: number;
  gradeAmount: number;
  koshThap: number;
  bimaThap: number;
  praABhatta: number;
  mahangiBhatta: number;
  protsahanBhatta?: number;
  anyaBhatta: number;
  
  // Special seasonal payments
  dashainBhatta: number; // साउन मा भुक्तानी हुने दसैं भत्ता
  poshakBhatta: number; // चैत मा भुक्तानी हुने पोशाक भत्ता
  
  // Totals for the month
  regularMonthlyGross: number; // नियमित मासिक तलब जम्मा
  totalMonthlyGross: number; // दसैं/पोशाक सहित कुल मासिक निकासा
  
  // Deductions
  koshKatti: number;
  bimaKatti: number;
  citKatti: number;
  otherKatti: number;
  totalMonthlyKatti: number;
  
  // Tax and Net
  taxableAmount: number;
  tax1Percent: number;
  netPayable: number;
}

export interface FiscalYearPayroll {
  fiscalYear: string; // e.g. '२०८२/८३', '२०८१/८२'
  periodTitle: string; // e.g. '२०८२ साल वैशाखदेखि २०८३ असार सम्मको तलबी भर्पाई'
  monthsCount: number; // default 3 (त्रैमासिक)
  teachers: TeacherRecord[];
  createdAt?: string;
  notes?: string;
  specialAllowanceSettings?: SpecialAllowanceSettings;
  includeDashain?: boolean; // साउनमा दसैं भत्ता त्रैमासिक जम्मामा जोड्ने वा नजोड्ने
  includePoshak?: boolean; // चैतमा पोशाक भत्ता त्रैमासिक जम्मामा जोड्ने वा नजोड्ने
  selectedQuarter?: 'first' | 'second' | 'third' | 'fourth' | 'custom' | 'yearly' | 'nine_months' | 'three_months' | 'split_9_3';
  customPeriodMonths?: number;
  customPeriodDays?: number;
  customPeriodLabel?: string;
}

export interface SchoolInfo {
  schoolName: string; // श्री मंगल सिंह माध्यमिक विद्यालय
  address: string; // सुनवर्षी- १, कैचना, मोरङ
  municipality: string; // सुनवर्षी नगरपालिका
  district: string; // मोरङ
  province: string; // कोशी प्रदेश
  headmasterName: string; // सन्तलाल सोरेन (प्रधानाध्यापक)
  accountantName: string; // कृष्ण प्रसाद रिजाल (लेखापाल)
  inspectorName?: string; // विद्यालय व्यवस्थापन समिति अध्यक्ष
}
