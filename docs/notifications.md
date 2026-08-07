# Booking Confirmation & Notifications (MVP)

## What a customer now sees
After booking, a **confirmation screen** shows the appointment (professional, service, date, time, price) with quick links to My Bookings / home. A **notifications feed** (home header → "התראות") lists booking confirmations and cancellations; tapping marks them read. Hebrew, RTL.

## Under the hood
Booking create/cancel emit an in-app notification (best-effort; never blocks the booking). Stored in `notifications` (migration 0006). No push infrastructure introduced.

## Run (real environment)
Apply migrations `0001`-`0006` + seeds; book a slot → see the confirmation screen; open the notifications feed; cancel a booking → see the cancellation notification.

## Not yet
No push delivery (FCM/APNs), email/SMS channels, or unread badge count — later milestones once a delivery provider is added.

## Verification status
Templates — executed unit tests. Module + e2e — authored, syntax-checked; e2e runs in real env. Mobile — authored; validated on a device.
