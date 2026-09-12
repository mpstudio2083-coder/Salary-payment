import { FiscalYearPayroll, SchoolInfo } from '../types';
import { calculateGrandTotals } from '../utils/calculations';

export function exportPayrollToCsv(
  payroll: FiscalYearPayroll,
  schoolInfo: SchoolInfo
) {
  const { teachers, periodTitle, fiscalYear, monthsCount } = payroll;
  const totals = calculateGrandTotals(teachers);

  const headers = [
    'क्र. सं.',
    'शिक्षकको नाम',
    'पद / श्रेणी',
    'तलब स्केल',
    'ग्रेड संख्या',
    'ग्रेड दर',
    'ग्रेड रकम',
    'क. कोष थप',
    'बिमा थप',
    'प्र.अ. भत्ता',
    'महँगी भत्ता',
    'प्रोत्साहन भत्ता',
    'अन्य भत्ता',
    'एक महिनाको जम्मा',
    `${monthsCount} महिनाको जम्मा`,
    'क. कोष कट्टी',
    'बिमा कट्टी',
    'सा. क. कोष कट्टी',
    'एक महिनाको जम्मा कट्टी',
    `${monthsCount} महिनाको जम्मा कट्टी`,
    'दसैं / पोशाक भत्ता',
    'पाउने कुल रकम',
    '१% सामाजिक सुरक्षा कर',
    'एक महिनाको खुद पाउने',
    'खुद पाउने रकम'
  ];

  const rows = teachers.map((t) => [
    t.sn,
    `"${t.name}"`,
    `"${t.designation}"`,
    t.basicSalary || 0,
    t.gradeCount || 0,
    t.gradeRate || 0,
    t.gradeAmount || 0,
    t.koshThap || 0,
    t.bimaThap || 0,
    t.praABhatta || 0,
    t.mahangiBhatta || 0,
    t.protsahanBhatta || 0,
    t.anyaBhatta || 0,
    t.monthlyGross || 0,
    t.periodGross || 0,
    t.koshKatti || 0,
    t.bimaKatti || 0,
    t.citKatti || 0,
    t.monthlyKatti || 0,
    t.periodKatti || 0,
    t.dashainPoshakBhatta || 0,
    t.periodPayableGross || 0,
    t.tax1Percent || 0,
    t.monthlyNet || 0,
    t.periodNet || 0
  ]);

  const totalRow = [
    'अन्तिम जम्मा (कुल)',
    '',
    '',
    totals.basicSalary,
    totals.gradeCount,
    '',
    totals.gradeAmount,
    totals.koshThap,
    totals.bimaThap,
    totals.praABhatta,
    totals.mahangiBhatta,
    totals.protsahanBhatta || 0,
    totals.anyaBhatta,
    totals.monthlyGross,
    totals.periodGross,
    totals.koshKatti,
    totals.bimaKatti,
    totals.citKatti,
    totals.monthlyKatti,
    totals.periodKatti,
    totals.dashainPoshakBhatta,
    totals.periodPayableGross,
    totals.tax1Percent,
    totals.monthlyNet,
    totals.periodNet
  ];

  // CSV content with UTF-8 BOM for Excel support
  let csvContent = '\uFEFF';
  csvContent += `"${schoolInfo.schoolName}, ${schoolInfo.address}"\n`;
  csvContent += `"${periodTitle} (आ.व. ${fiscalYear})"\n\n`;
  csvContent += headers.join(',') + '\n';

  rows.forEach((row) => {
    csvContent += row.join(',') + '\n';
  });

  csvContent += totalRow.join(',') + '\n\n';
  csvContent += `"लेखापाल: ${schoolInfo.accountantName}","","","स्वीकृत गर्ने प्रधानाध्यापक: ${schoolInfo.headmasterName}"\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Talabi_Bharpai_${fiscalYear.replace('/', '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
