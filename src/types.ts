/**
 * Awais Tailor House - Types & Data Models
 */

export type Language = 'en' | 'ur';

export type MeasurementUnit = 'inches' | 'cm';

export type ThermalWidth = '58mm' | '80mm';

export type PrintFormat = 'thermal-58' | 'thermal-80' | 'a4';

export interface ShopSettings {
  shopNameEn: string;
  shopNameUr: string;
  location: string;
  phone: string;
  currency: string;
  unit: MeasurementUnit;
  language: Language;
  thermalWidth: ThermalWidth;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  notes?: string;
}

export interface CustomMeasurement {
  id: string;
  name: string;
  value: string;
  unit?: string;
  notes?: string;
}

export interface CustomMeasurementDefinition {
  id: string;
  name: string;
  nameUr?: string;
  unit: 'Inches' | 'CM';
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderClothingItem {
  id: string;
  clothingType: string;
  quantity: number;
  price: number;
  total: number;
  specialInstructions?: string;
}

/**
 * Standard Tailor Measurements & Traditional Slip Fields
 */
export interface StandardMeasurements {
  neck: string;         // 1. Neck / Collar - کالر / گردن کا ناپ
  chest: string;        // 2. Chest / Chati - چھاتی / سینہ کا ناپ
  waist: string;        // 3. Waist / Width - چوڑائی / کمر کا ناپ
  hip: string;          // 4. Hip - ہپ کا ناپ
  totalLength: string;  // 5. Total Length / Lambai - لمبائی / قد
  sleeveLength: string; // 6. Sleeve Length / Bazu - بازو کا ناپ
  bottom: string;       // 7. Bottom / Paancha - پانچہ کا ناپ
  shoulder: string;     // 8. Shoulder / Tira - تیرا / کندھوں کا ناپ
  backWidth: string;    // 9. Back Width / Ghera - گھیرا / پیٹھ کا ناپ
  upperArm: string;     // 10. Upper Arm - بازو کا اوپری ناپ
  lowerArm: string;     // 11. Lower Arm - بازو کا نچلا ناپ
  wrist: string;        // 12. Wrist - کلائی کا ناپ
  cuff: string;         // 13. Cuff - آستین کُنّہ / کف

  // Handwritten Pakistani Tailor Slip Options
  damanStyle?: 'simple' | 'round'; // سادہ لامن / گول لامن
  cuffStyle?: 'simple' | 'round' | 'open'; // سادہ کف / گول کف / کھلا بازو
  collarStyle?: 'ban' | 'collar'; // بین (Bain / BAN) / کالر (Collar)
  collarPattiStyle?: 'simple' | 'pencil' | 'color'; // Legacy compatibility
  selectedColor?: string; // Colour selection if needed elsewhere
  shalwarPocket?: 'yes' | 'no'; // شلوار جیب: ہاں / نہیں
  frontPocket?: 'yes' | 'no'; // سامنے جیب: ہاں / نہیں
  sidePocket?: 'none' | 'one' | 'two'; // سائیڈ جیب: کوئی نہیں / ایک / دو
  coatStyle?: 'none' | 'simple' | 'shiny'; // Coat style: Simple / Shiny with Yes/No
  buttonType?: 'simple' | 'fancy' | 'metal' | 'fabric'; // The button choices
  shalwar?: string; // شلوار
  tira?: string; // تیرا
  collar?: string; // کالر
  chati?: string; // چھاتی
  chodai?: string; // چوڑائی
  ghera?: string; // گھیرا
  paancha?: string; // پانچہ
}

export interface MeasurementRecord {
  id: string;
  customerId: string;
  date: string;
  title: string;
  measurements: StandardMeasurements;
  customMeasurements: CustomMeasurement[];
  clothingItems: OrderClothingItem[];
  deliveryDate?: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: 'cash' | 'jazzcash' | 'easypaisa' | 'bank';
  note?: string;
}

export interface OrderPaymentRecord {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  orderSummary: string;
  totalPrice: number;
  previousBalance?: number;
  totalDue?: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'paid' | 'partial' | 'pending';
  date: string;
  createdAt?: string;
  measurementId?: string;
  paymentHistory: PaymentTransaction[];
}

export interface PriceItem {
  id: string;
  nameEn: string;
  nameUr: string;
  defaultPrice: number;
  category: 'men' | 'women' | 'general';
}

export type ActiveScreen = 
  | 'dashboard'
  | 'customers'
  | 'customer-profile'
  | 'add-customer'
  | 'measurement'
  | 'payments'
  | 'prices'
  | 'settings'
  | 'custom-measurements';
