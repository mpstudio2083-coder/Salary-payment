/**
 * Nepali Numerals and Currency Formatting Utilities
 */

const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toNepaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '०';
  
  const str = typeof num === 'number' ? num.toString() : num;
  return str.replace(/[0-9]/g, (digit) => nepaliDigits[parseInt(digit, 10)]);
}

export function fromNepaliNumber(str: string): number {
  if (!str) return 0;
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(nepaliDigits[i], 'g'), englishDigits[i]);
  }
  // Remove commas
  result = result.replace(/,/g, '');
  const parsed = parseFloat(result);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format currency with Nepali numbering system (lakhs, crores)
 * e.g. 1234567.89 -> 12,34,567.89 or १२,३४,५६७.८९
 */
export function formatNepaliCurrency(
  val: number | undefined | null,
  options: { nepaliDigits?: boolean; decimals?: number } = {}
): string {
  const { nepaliDigits: useNepali = true, decimals = 2 } = options;
  if (val === undefined || val === null || isNaN(val)) {
    return useNepali ? '०.००' : '0.00';
  }

  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const fixed = absVal.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  let formattedInt = '';
  if (intPart.length <= 3) {
    formattedInt = intPart;
  } else {
    // Last 3 digits
    const last3 = intPart.substring(intPart.length - 3);
    const remaining = intPart.substring(0, intPart.length - 3);
    
    // Group remaining by 2 digits from right to left
    const pairs: string[] = [];
    let rem = remaining;
    while (rem.length > 2) {
      pairs.unshift(rem.substring(rem.length - 2));
      rem = rem.substring(0, rem.length - 2);
    }
    if (rem.length > 0) {
      pairs.unshift(rem);
    }
    formattedInt = pairs.join(',') + ',' + last3;
  }

  const result = (isNegative ? '-' : '') + formattedInt + (decimals > 0 ? '.' + decPart : '');

  if (useNepali) {
    return toNepaliNumber(result);
  }
  return result;
}

/**
 * Convert number into Nepali words (अक्षरूपी)
 */
const ones = [
  '', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ',
  'दश', 'एघार', 'बाह्र', 'तेह्र', 'चौध', 'पन्ध्र', 'सोह्र', 'सत्र', 'अठार', 'उन्नाइस',
  'बीस', 'एक्काइस', 'बाइस', 'तेइस', 'चौबिस', 'पच्चिस', 'छब्बीस', 'सत्ताइस', 'अट्ठाइस', 'उनन्तिस',
  'तीस', 'एकत्तिस', 'बत्तिस', 'तेत्तिस', 'चौँतीस', 'पैँतीस', 'छत्तिस', 'सरसत्तिस', 'अठत्तिस', 'उनन्चालीस',
  'चालीस', 'एकचालीस', 'बयालीस', 'त्रिचालीस', 'चवालीस', 'पैँतालीस', 'छयालीस', 'सत्चालीस', 'अठचालीस', 'उनन्चास',
  'पचास', 'एकाउन्न', 'बाउन्न', 'त्रिपन्न', 'चवन्न', 'पचपन्न', 'छपन्न', 'सन्ताउन्न', 'अन्ठाउन्न', 'उनन्साठी',
  'साठी', 'एकसट्ठी', 'बासट्ठी', 'त्रिचट्ठी', 'चौंसट्ठी', 'पैंसट्ठी', 'छयसट्ठी', 'सतसट्ठी', 'अठसट्ठी', 'उनन्सत्तरी',
  'सत्तरी', 'एकहत्तर', 'बहत्तर', 'त्रिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छयहत्तर', 'सतहत्तर', 'अठहत्तर', 'उनासी',
  'असी', 'एकासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छयासी', 'सतासी', 'अठासी', 'उनान्नब्बे',
  'नब्बे', 'एकान्नब्बे', 'बयानब्बे', 'त्रियान्नब्बे', 'चौरान्नब्बे', 'पन्चानब्बे', 'छयान्नब्बे', 'सन्तानब्बे', 'अन्ठान्ब्बे', 'उनान्सय'
];

export function numberToNepaliWords(n: number): string {
  if (isNaN(n) || n === 0) return 'शून्य रुपैयाँ मात्र';
  
  let num = Math.floor(Math.abs(n));
  const paisa = Math.round((Math.abs(n) - num) * 100);
  
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  
  let parts: string[] = [];
  
  if (crore > 0) {
    parts.push((ones[crore] || crore.toString()) + ' करोड');
  }
  if (lakh > 0) {
    parts.push((ones[lakh] || lakh.toString()) + ' लाख');
  }
  if (thousand > 0) {
    parts.push((ones[thousand] || thousand.toString()) + ' हजार');
  }
  if (hundred > 0) {
    parts.push((ones[hundred] || hundred.toString()) + ' सय');
  }
  if (remainder > 0) {
    parts.push(ones[remainder] || remainder.toString());
  }
  
  let words = parts.join(' ') + ' रुपैयाँ';
  if (paisa > 0) {
    words += ' ' + (ones[paisa] || paisa.toString()) + ' पैसा';
  }
  words += ' मात्र';
  
  return words;
}

// Aliases for compatibility
export const formatCurrency = formatNepaliCurrency;
export const numberToWordsNepali = numberToNepaliWords;
