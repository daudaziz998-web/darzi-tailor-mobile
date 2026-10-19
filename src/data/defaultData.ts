import { Customer, MeasurementRecord, OrderPaymentRecord, PriceItem, ShopSettings } from '../types';

export const defaultSettings: ShopSettings = {
  shopNameEn: 'Awais Tailor House',
  shopNameUr: 'اویس ٹیلر ہاؤس',
  location: 'Talash, Shamshi Khan',
  phone: '0300-1234567',
  currency: 'Rs.',
  unit: 'inches',
  language: 'en',
  thermalWidth: '80mm',
};

export const defaultPrices: PriceItem[] = [
  {
    id: 'price-1',
    nameEn: 'Shalwar Kameez',
    nameUr: 'شلوار قمیض',
    defaultPrice: 1500,
    category: 'men',
  },
  {
    id: 'price-2',
    nameEn: 'Pant Shirt',
    nameUr: 'پینٹ شرٹ',
    defaultPrice: 1200,
    category: 'men',
  },
  {
    id: 'price-3',
    nameEn: 'Waistcoat',
    nameUr: 'واسکوٹ',
    defaultPrice: 1000,
    category: 'men',
  },
  {
    id: 'price-4',
    nameEn: 'Kurta',
    nameUr: 'کرتہ',
    defaultPrice: 900,
    category: 'men',
  },
  {
    id: 'price-5',
    nameEn: 'Shalwar Only',
    nameUr: 'صرف شلوار',
    defaultPrice: 600,
    category: 'general',
  },
  {
    id: 'price-6',
    nameEn: 'Kameez Only',
    nameUr: 'صرف قمیض',
    defaultPrice: 800,
    category: 'general',
  },
  {
    id: 'price-7',
    nameEn: 'Safari Suit',
    nameUr: 'سفاری سوٹ',
    defaultPrice: 2500,
    category: 'men',
  },
  {
    id: 'price-8',
    nameEn: 'Coat / Blazer',
    nameUr: 'کوٹ / شیروانی',
    defaultPrice: 4000,
    category: 'men',
  },
];

export const defaultCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Muhammad Ali',
    phone: '0300 7891234',
    address: 'Talash Bazaar, Shamshi Khan',
    createdAt: '2026-08-10',
    notes: 'Regular customer, prefers loose comfort fit',
  },
  {
    id: 'cust-2',
    name: 'Tariq Mahmood',
    phone: '0321 4567890',
    address: 'Main Road, Shamshi Khan',
    createdAt: '2026-09-05',
    notes: 'Likes stiff collar and concealed front buttons',
  },
  {
    id: 'cust-3',
    name: 'Usman Ghani',
    phone: '0333 9876543',
    address: 'Near Jamia Masjid, Talash',
    createdAt: '2026-09-22',
    notes: 'Prefers slim fit kurtas and narrow bottom',
  },
];

export const defaultMeasurements: MeasurementRecord[] = [
  {
    id: 'meas-1',
    customerId: 'cust-1',
    date: '2026-10-02',
    title: 'Winter Shalwar Kameez Fitting',
    measurements: {
      neck: '16',
      chest: '42',
      waist: '38',
      hip: '40',
      totalLength: '42.5',
      sleeveLength: '24',
      bottom: '16',
      shoulder: '18',
      backWidth: '17.5',
      upperArm: '14',
      lowerArm: '11.5',
      wrist: '8.5',
      cuff: '9.5',
    },
    customMeasurements: [
      { id: 'cm-1', name: 'Pocket Depth', value: '8', unit: 'inches', notes: 'Deep front pocket' },
      { id: 'cm-2', name: 'Collar Style', value: 'Sherwani Ban', unit: 'type', notes: 'Stiff buckram' },
    ],
    clothingItems: [
      {
        id: 'ci-1',
        clothingType: 'Shalwar Kameez',
        quantity: 2,
        price: 1500,
        total: 3000,
        specialInstructions: '2 pockets, white buttons',
      },
    ],
    deliveryDate: '2026-10-10',
    notes: 'Double cuff, soft ban collar',
  },
  {
    id: 'meas-2',
    customerId: 'cust-1',
    date: '2026-08-12',
    title: 'Summer Cotton Kurta',
    measurements: {
      neck: '16',
      chest: '41.5',
      waist: '37.5',
      hip: '39.5',
      totalLength: '42',
      sleeveLength: '24',
      bottom: '16',
      shoulder: '18',
      backWidth: '17',
      upperArm: '13.5',
      lowerArm: '11',
      wrist: '8.5',
      cuff: '9',
    },
    customMeasurements: [
      { id: 'cm-3', name: 'Front Pocket', value: '1', unit: 'count', notes: 'Single pocket' },
    ],
    clothingItems: [
      {
        id: 'ci-2',
        clothingType: 'Kurta',
        quantity: 1,
        price: 900,
        total: 900,
        specialInstructions: 'Lawn cotton fabric',
      },
    ],
    deliveryDate: '2026-08-20',
    notes: 'Summer wear',
  },
];

export const defaultPayments: OrderPaymentRecord[] = [
  {
    id: 'pay-1',
    orderId: 'ord-meas-1',
    customerId: 'cust-1',
    customerName: 'Muhammad Ali',
    orderSummary: '2x Shalwar Kameez',
    totalPrice: 3000,
    paidAmount: 1500,
    remainingAmount: 1500,
    status: 'partial',
    date: '2026-10-02',
    paymentHistory: [
      {
        id: 'pt-1',
        date: '2026-10-02',
        amount: 1500,
        method: 'cash',
        note: 'Advance payment',
      },
    ],
  },
];
