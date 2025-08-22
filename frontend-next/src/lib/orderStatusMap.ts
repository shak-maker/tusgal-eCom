import { OrderStatus } from '@prisma/client';

// Map English enum values to Mongolian display text
export const orderStatusMap: Record<OrderStatus, string> = {
  PENDING: 'ХҮЛЭЭГДЭЖ БАЙНА',
  CONFIRMED: 'БАТЛАГДСАН',
  SHIPPED: 'ХҮРГЭЛТ ГАРСАН',
  DELIVERED: 'ХҮРГЭЛТ ДУУССАН',
  CANCELLED: 'ЦУЦЛАГДСАН',
  PAID: 'ТӨЛӨГДСӨН',
  FAILED: 'АМЖИЛТГҮЙ'
};

// Map Mongolian text back to English enum values
export const reverseOrderStatusMap: Record<string, OrderStatus> = {
  'ХҮЛЭЭГДЭЖ БАЙНА': 'PENDING',
  'БАТЛАГДСАН': 'CONFIRMED',
  'ХҮРГЭЛТ ГАРСАН': 'SHIPPED',
  'ХҮРГЭЛТ ДУУССАН': 'DELIVERED',
  'ЦУЦЛАГДСАН': 'CANCELLED',
  'ТӨЛӨГДСӨН': 'PAID',
  'АМЖИЛТГҮЙ': 'FAILED'
};

// Helper function to get Mongolian text from English status
export function getMongolianStatus(status: OrderStatus): string {
  return orderStatusMap[status] || status;
}

// Helper function to get English status from Mongolian text
export function getEnglishStatus(mongolianText: string): OrderStatus | null {
  return reverseOrderStatusMap[mongolianText] || null;
}

// Get all available statuses for dropdowns
export function getAvailableStatuses(): Array<{ value: OrderStatus; label: string }> {
  return Object.entries(orderStatusMap).map(([value, label]) => ({
    value: value as OrderStatus,
    label
  }));
}
