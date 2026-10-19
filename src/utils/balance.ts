import { OrderPaymentRecord } from '../types';

/**
 * Calculates a customer's carry-forward previous unpaid balance.
 *
 * Example:
 * Order 1: Total = 1,500, Paid = 1,000, Remaining = 500
 * Order 2 carries forward Previous Balance = 500
 * If Order 2: Total = 1,500 + 500 = 2,000, Paid = 2,000, Remaining = 0
 * Order 3 carries forward Previous Balance = 0
 */
export function getCustomerPreviousBalance(customerId: string, orders: OrderPaymentRecord[]): number {
  if (!customerId || !orders || orders.length === 0) return 0;

  const customerOrders = orders.filter((o) => o.customerId === customerId);
  if (customerOrders.length === 0) return 0;

  // Sort orders chronologically ascending (oldest first, newest last)
  const sorted = [...customerOrders].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
      return timeA - timeB;
    }
    return a.id.localeCompare(b.id);
  });

  const getRem = (o: any) => Math.max(0, Number(o.remainingAmount !== undefined ? o.remainingAmount : o.remaining_amount) || 0);
  const getPrev = (o: any) => Number(o.previousBalance !== undefined ? o.previousBalance : o.previous_balance) || 0;

  // Find index of the most recent order that had carried forward a previous balance
  let anchorIdx = -1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (getPrev(sorted[i]) > 0) {
      anchorIdx = i;
      break;
    }
  }

  if (anchorIdx >= 0) {
    // Orders before anchorIdx were rolled into sorted[anchorIdx].
    // Total unpaid is the remaining on sorted[anchorIdx] plus any subsequent orders
    let total = getRem(sorted[anchorIdx]);
    for (let j = anchorIdx + 1; j < sorted.length; j++) {
      total += getRem(sorted[j]);
    }
    return total;
  }

  // If no order had previousBalance > 0, sum the remaining amount of all customer orders
  const totalUnpaid = customerOrders.reduce((sum, o) => sum + getRem(o), 0);
  return Math.max(0, totalUnpaid);
}

/**
 * Returns each customer's ONE current bill containing:
 * - Previous Balance
 * - Current Order Total
 * - Total Due
 * - Paid
 * - Remaining
 *
 * Older orders remain in history and are not shown as duplicate current bills.
 */
export function getCustomerCurrentBills(orders: OrderPaymentRecord[]): {
  currentBills: OrderPaymentRecord[];
  pastOrdersByCustomer: Map<string, OrderPaymentRecord[]>;
} {
  const byCustomer = new Map<string, OrderPaymentRecord[]>();

  for (const o of orders) {
    if (!byCustomer.has(o.customerId)) {
      byCustomer.set(o.customerId, []);
    }
    byCustomer.get(o.customerId)!.push(o);
  }

  const currentBills: OrderPaymentRecord[] = [];
  const pastOrdersByCustomer = new Map<string, OrderPaymentRecord[]>();

  byCustomer.forEach((custOrders, customerId) => {
    // Sort chronologically ascending (oldest first, newest last so sorted[last] is the current bill)
    const sorted = [...custOrders].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeA - timeB;
      }
      return a.id.localeCompare(b.id);
    });

    const currentBill = sorted[sorted.length - 1];
    const past = sorted.slice(0, sorted.length - 1).reverse(); // newest past order first in history

    currentBills.push(currentBill);
    pastOrdersByCustomer.set(customerId, past);
  });

  // Sort current bills by date/createdAt descending (newest bill at top of payments table)
  currentBills.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  return { currentBills, pastOrdersByCustomer };
}
