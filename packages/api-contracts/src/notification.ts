/** In-app notification (customer-facing feed). */
export interface NotificationView {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly body: string;
  readonly read: boolean;
  readonly createdAt: string; // ISO-8601
}
