/** Pure notification templates (server-generated Hebrew text; unit-tested). */
export interface BookingNotificationData {
  readonly professionalName: string;
  readonly serviceName: string;
  readonly date: string;
  readonly start: string;
}
export interface BuiltNotification {
  readonly type: string;
  readonly title: string;
  readonly body: string;
}

export const bookingConfirmed = (d: BookingNotificationData): BuiltNotification => ({
  type: 'booking_confirmed',
  title: 'התור נקבע בהצלחה',
  body: `${d.serviceName} עם ${d.professionalName} בתאריך ${d.date} בשעה ${d.start}`,
});

export const bookingCancelled = (d: BookingNotificationData): BuiltNotification => ({
  type: 'booking_cancelled',
  title: 'התור בוטל',
  body: `הביטול נקלט: ${d.serviceName} עם ${d.professionalName} (${d.date} ${d.start})`,
});
