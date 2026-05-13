
import { Customer, Order, EmailMessage, GalleryItem, RecentOrder } from './types.ts';

export const CURRENT_CUSTOMER: Customer = {
  id: '376',
  name: 'Arthur Cook',
  address: ['Iffley Rd', 'Oxford OX4 1EQ', 'United Kingdom'],
  email: 'marwelgkcurry83@gmail.com',
  phone: '+441865241971',
  avatarUrl: 'https://picsum.photos/seed/arthur/200/200'
};

export const COMPANY_INFO = {
  name: 'HOB FURNITURE',
  contact: 'Emma Kitchen',
  address: ['4th Floor 205 Regent Street', 'London - W1B 4HB'],
  regNo: '14667294',
  email: 'customerservice@hobfurniture.co.uk',
  website: 'www.hobfurniture.co.uk',
  terms: 'Deposit amount only, balance due upon completion',
  paymentInstructions: 'Please pay this invoice via bank transfer (see details below) and include this payment reference: 39838265.',
  logoUrl: 'https://placehold.co/150x80/2563eb/ffffff?text=HOB+FURNITURE',
  bankName: 'SUMUP LIMITED',
  sortCode: '041450',
  accountNo: '58291337',
  accountHolder: 'HOB FURNITURE',
  swift: 'SUPAGB21XXX',
  iban: 'GB42SUPA04145058291337'
};

export const SAMPLE_ORDER: Order = {
  id: 'ord_2026_376',
  orderNumber: 'HOB-2026-376',
  date: '14/09/2026',
  dueDate: '19/09/2026',
  paymentDate: '14/09/2026',
  paymentMethod: 'Bank Transfer',
  paymentReference: '39838265',
  status: 'Confirmed',
  items: [
    {
      id: 'item_1',
      description: 'Clinton Cinema Sofa',
      details: ['12ft x 4ft', 'Fabric: Alaska Madrid Chenielle'],
      quantity: 1.00,
      unit: 'each',
      price: 2000.00,
      total: 2000.00
    }
  ],
  subtotal: 2000.00,
  tax: 0,
  total: 2000.00,
  amountPaid: 2000.00,
  amountDue: 0.00
};

export const INITIAL_RECENT_ORDERS: RecentOrder[] = [
  {
    id: 'ro_1',
    orderNumber: 'HOB-2026-409',
    description: 'Washington 4 poster bed - king',
    date: '01/01/2026',
    status: 'Confirmed'
  },
  {
    id: 'ro_2',
    orderNumber: '2024-892',
    description: 'Velvet Throw Pillows (Set of 2)',
    date: '12/08/2024',
    status: 'Delivered'
  }
];

export const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: 'msg_1',
    from: 'Emma Kitchen',
    fromEmail: 'customerservice@hobfurniture.co.uk',
    to: 'Arthur Cook',
    subject: 'Order #HOB-2026-376 Confirmation - HOB Furniture',
    date: 'Sep 14, 2026, 10:30 AM',
    body: `Dear Arthur,

Thank you for your order with HOB Furniture. We are pleased to confirm we have received your deposit and your order is now being processed.

Your estimated delivery date is currently being calculated based on the production schedule for your Clinton Cinema Sofa.

If you have any questions, please simply reply to this email.

Best regards,
Emma Kitchen
HOB Furniture`,
    isIncoming: true
  },
  {
    id: 'msg_2',
    from: 'Arthur Cook',
    fromEmail: 'marwelgkcurry83@gmail.com',
    to: 'Emma Kitchen',
    subject: 'Re: Order #HOB-2026-376 Confirmation - HOB Furniture',
    date: 'Sep 15, 2026, 09:15 AM',
    body: `Hi Emma,

Thanks for the confirmation. I just wanted to double-check if the fabric "Alaska Madrid Chenielle" is the stain-resistant version? We have a dog and just want to be sure.

Thanks,
Arthur`,
    isIncoming: false
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'g_1',
    url: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=800',
    caption: 'Frame assembly started',
    date: 'Sep 16, 2026',
    type: 'production'
  },
  {
    id: 'g_2',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
    caption: 'Fabric cutting for Alaska Madrid Chenielle',
    date: 'Sep 17, 2026',
    type: 'production'
  }
];
