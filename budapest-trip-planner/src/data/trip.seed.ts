import type { TripPlan } from '@/types';

/**
 * The real Budapest itinerary, 2026-09-29 through 2026-10-05.
 *
 * Conventions used to fit the real schedule onto the existing model
 * without changing it or inventing data:
 *
 * - `endTime` is omitted wherever the real plan only gives a single check-in
 *   time (most restaurant/nightlife stops) — never invented. Schedule math
 *   (`lib/tripSchedule.ts`) falls back to the linked place's own
 *   `estimatedDurationMinutes` for these.
 * - `startTime`/`endTime` past midnight use extended hours ("24:00",
 *   "25:30", "26:00") while staying in the PREVIOUS evening's TripDay —
 *   e.g. Ötkert (00:00 on Oct 2) is stored under Oct 1 with startTime
 *   "24:00", so it still sorts after everything else that night instead of
 *   jumping to the top of Oct 2. Display code (`formatClockTime`) wraps it
 *   back to a normal clock reading. SPARTY (21:30 → 02:00, the same
 *   evening) uses endTime "26:00" for the same reason.
 * - Status maps the brief's four-way classification onto the existing
 *   enum: CONFIRMED → 'confirmed', PLANNED → 'suggested' (expected but not
 *   locked), FLEXIBLE and OPTIONAL → 'flexible' (genuinely open / only
 *   happens if conditions are right) — the "only if" nuance for OPTIONAL
 *   items lives in `notes` since the type has no separate field for it.
 * - Multi-place blocks the brief explicitly says to treat as ONE combined
 *   item (Central Budapest exploration; Váci St. + Fashion St.; Buda
 *   Castle + Fisherman's Bastion) have no single `placeId` — the included
 *   places are named in `notes` instead of picking one arbitrarily.
 * - Bubble Football has no catalog entry: `placeId` is optional and the
 *   architecture doesn't require one, so per the brief it's a plain titled
 *   item instead of inventing a new Place record.
 * - "Wake up" entries aren't real activities and aren't represented.
 */

export const TRIP_SEED: TripPlan = {
  destination: 'Budapest',
  timezone: 'Europe/Budapest',
  days: [
    {
      id: 'day-1',
      date: '2026-09-29',
      dayNumber: 1,
      title: 'נחיתה + Ruin Bar',
      scheduleItems: [
        {
          id: 'd1-landing',
          startTime: '13:45',
          title: 'נחיתה בבודפשט',
          type: 'FLIGHT',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd1-transfer',
          startTime: '14:30',
          endTime: '15:00',
          title: 'נסיעה למלון',
          type: 'TRANSPORT',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd1-hotel-checkin',
          startTime: '15:00',
          endTime: '16:30',
          title: 'צ׳ק-אין, מקלחת ומנוחה',
          type: 'HOTEL',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd1-central-budapest',
          startTime: '16:30',
          endTime: '18:30',
          title: 'סיבוב ראשון במרכז',
          type: 'ATTRACTION',
          status: 'suggested',
          fixed: false,
          notes:
            'כולל: Deák Ferenc tér, הרובע היהודי, Gozsdu, חנויות ואטמוספרה. בלוק גמיש אחד — לא שלוש פעילויות קבועות נפרדות.',
        },
        {
          id: 'd1-cinquecento',
          startTime: '19:00',
          title: 'Cinquecento',
          type: 'RESTAURANT',
          placeId: 'cinquecento-budapest',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd1-szimpla',
          startTime: '21:00',
          title: 'Szimpla Kert',
          type: 'NIGHTLIFE',
          placeId: 'szimpla-kert',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd1-instant-fogas',
          startTime: '23:30',
          title: 'Instant-Fogas',
          type: 'NIGHTLIFE',
          placeId: 'instant-fogas-complex',
          status: 'confirmed',
          fixed: true,
        },
      ],
    },
    {
      id: 'day-2',
      date: '2026-09-30',
      dayNumber: 2,
      title: 'אדרנלין + אוכל אסייתי',
      scheduleItems: [
        {
          id: 'd2-breakfast',
          startTime: '10:00',
          title: '2D Café',
          type: 'RESTAURANT',
          placeId: '2d-cafe-beloved',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd2-flashkart',
          startTime: '12:00',
          title: 'FlashKart',
          type: 'ATTRACTION',
          placeId: 'flashkart',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd2-axe-throwing',
          startTime: '15:00',
          endTime: '17:00',
          title: 'Axe Throwing',
          type: 'ATTRACTION',
          placeId: 'axe-throwing-balta-dobalas',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd2-hotel-rest',
          startTime: '17:30',
          endTime: '19:00',
          title: 'מקלחות ומנוחה',
          type: 'HOTEL',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd2-trofea',
          startTime: '19:30',
          title: 'Trófea Grill',
          type: 'RESTAURANT',
          placeId: 'trofea-grill',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd2-doboz',
          startTime: '22:30',
          title: 'Doboz',
          type: 'NIGHTLIFE',
          placeId: 'doboz',
          status: 'confirmed',
          fixed: true,
        },
      ],
    },
    {
      id: 'day-3',
      date: '2026-10-01',
      dayNumber: 3,
      title: 'SHOPPING + STEAK + NIGHT',
      scheduleItems: [
        {
          id: 'd3-westend',
          startTime: '10:30',
          endTime: '15:30',
          title: 'Westend',
          type: 'SHOPPING',
          placeId: 'westend',
          status: 'confirmed',
          fixed: true,
          notes: 'בלוק השופינג המרכזי של היום.',
        },
        {
          id: 'd3-vaci-fashion',
          startTime: '15:30',
          endTime: '17:30',
          title: 'Váci Street + Fashion Street',
          type: 'SHOPPING',
          status: 'confirmed',
          fixed: true,
          notes: 'כולל: Váci Street, Fashion Street — בלוק שופינג משולב אחד.',
        },
        {
          id: 'd3-hotel-rest',
          startTime: '17:30',
          endTime: '19:00',
          title: 'מנוחה והתארגנות',
          type: 'HOTEL',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd3-beerstro14',
          startTime: '20:00',
          title: 'Beerstro14 Steak House',
          type: 'RESTAURANT',
          placeId: 'beerstro14-steak-house',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd3-gemini',
          startTime: '22:30',
          title: 'Gemini Lounge',
          type: 'NIGHTLIFE',
          placeId: 'gemini-lounge',
          status: 'confirmed',
          fixed: true,
        },
        {
          // Clock-wise 00:00 on Oct 2, but belongs to Oct 1's nightlife plan — extended hour keeps it sorting last tonight, not first tomorrow.
          id: 'd3-otkert',
          startTime: '24:00',
          title: 'Ötkert',
          type: 'NIGHTLIFE',
          placeId: 'otkert',
          status: 'confirmed',
          fixed: true,
          notes: 'חוצה חצות — שייך ללילה של 1.10, מתחיל בפועל ב-00:00 ב-2.10.',
        },
      ],
    },
    {
      id: 'day-4',
      date: '2026-10-02',
      dayNumber: 4,
      title: 'Aquaworld + Concept Bar + Techno',
      scheduleItems: [
        {
          id: 'd4-aquaworld',
          startTime: '10:30',
          endTime: '15:00',
          title: 'Aquaworld',
          type: 'ATTRACTION',
          placeId: 'aquaworld-budapest',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd4-light-food',
          startTime: '15:30',
          title: 'אוכל קל',
          type: 'RESTAURANT',
          status: 'flexible',
          fixed: false,
          notes: 'לא מסעדה מאושרת — מנוע ההמלצות צריך לבחור כאן אופציית אוכל קל שמתאימה לחלון הזמן.',
        },
        {
          id: 'd4-hotel-rest',
          startTime: '16:30',
          endTime: '19:00',
          title: 'מנוחה',
          type: 'HOTEL',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd4-the-magic',
          startTime: '20:00',
          title: 'The MAGIC',
          type: 'NIGHTLIFE',
          placeId: 'the-magic-bar',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd4-hotsy-totsy',
          startTime: '22:00',
          title: 'Hotsy Totsy',
          type: 'NIGHTLIFE',
          placeId: 'hotsy-totsy-budapest',
          status: 'confirmed',
          fixed: true,
        },
        {
          // Clock-wise 00:00 on Oct 3, but belongs to Oct 2's nightlife plan.
          id: 'd4-aether',
          startTime: '24:00',
          title: 'AETHER',
          type: 'NIGHTLIFE',
          placeId: 'aether-club',
          status: 'confirmed',
          fixed: true,
          notes: 'חוצה חצות — שייך ללילה של 2.10, מתחיל בפועל ב-00:00 ב-3.10.',
        },
      ],
    },
    {
      id: 'day-5',
      date: '2026-10-03',
      dayNumber: 5,
      title: 'Bubble Football + SPARTY',
      scheduleItems: [
        {
          id: 'd5-grumpy',
          startTime: '11:00',
          title: 'Grumpy Budapest',
          type: 'RESTAURANT',
          placeId: 'grumpy-budapest',
          status: 'confirmed',
          fixed: true,
        },
        {
          // No catalog place — architecture doesn't require one for a ScheduleItem, so none was added (see file header).
          id: 'd5-bubble-football',
          startTime: '13:30',
          endTime: '15:30',
          title: 'Bubble Football',
          type: 'ATTRACTION',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd5-hotel-rest',
          startTime: '16:00',
          endTime: '18:30',
          title: 'מקלחות + מנוחה',
          type: 'HOTEL',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd5-mr-smash',
          startTime: '19:00',
          title: 'Mr.Smash',
          type: 'RESTAURANT',
          placeId: 'mr-smash',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd5-warm-up',
          startTime: '20:15',
          title: 'Warm Up Cocktail Bar',
          type: 'NIGHTLIFE',
          placeId: 'warm-up-cocktail-bar',
          status: 'confirmed',
          fixed: true,
        },
        {
          // 21:30 -> 02:00 the same night; "26:00" is 02:00 encoded past midnight so the item's own duration comes out correct (4.5h).
          id: 'd5-sparty',
          startTime: '21:30',
          endTime: '26:00',
          title: 'SPARTY',
          type: 'NIGHTLIFE',
          placeId: 'sparty-szechenyi',
          status: 'confirmed',
          fixed: true,
          notes: 'אירוע מאושר, לילה ארוך ועתיר אנרגיה — אין להמליץ על מועדון נוסף אחרי SPARTY כברירת מחדל.',
        },
      ],
    },
    {
      id: 'day-6',
      date: '2026-10-04',
      dayNumber: 6,
      title: 'Classic Budapest + Danube Night Cruise',
      scheduleItems: [
        {
          id: 'd6-castle-bastion',
          startTime: '12:00',
          endTime: '16:00',
          title: 'Buda Castle + Fisherman’s Bastion',
          type: 'ATTRACTION',
          status: 'confirmed',
          fixed: true,
          notes: 'כולל: Buda Castle, Fisherman’s Bastion — נופים, צילום, הליכה. בלוק תיור משולב אחד.',
        },
        {
          id: 'd6-kurtoskalacs',
          startTime: '16:15',
          title: 'Molnár’s kürtőskalács',
          type: 'RESTAURANT',
          placeId: 'molnars-kurtoskalacs',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd6-hotel-rest',
          startTime: '17:00',
          endTime: '18:30',
          title: 'מנוחה והתארגנות',
          type: 'HOTEL',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd6-getto-gulyas',
          startTime: '19:00',
          title: 'Gettó Gulyás',
          type: 'RESTAURANT',
          placeId: 'getto-gulyas',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd6-danube-cruise',
          startTime: '21:00',
          endTime: '22:30',
          title: 'Danube Night Cruise',
          type: 'ATTRACTION',
          placeId: 'danube-night-cruise',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd6-jardin',
          startTime: '22:45',
          title: 'Jardín',
          type: 'NIGHTLIFE',
          placeId: 'jardin-cocktail-bar',
          status: 'confirmed',
          fixed: true,
        },
        {
          // Clock-wise 00:00 on Oct 5, but belongs to Oct 4's nightlife plan.
          id: 'd6-casino',
          startTime: '24:00',
          title: 'קזינו',
          type: 'NIGHTLIFE',
          placeId: 'tropicana-casino',
          status: 'suggested',
          fixed: false,
          notes:
            'אופציית לילה גמישה מתוכננת (לא מאושרת). תקציב הימורים מומלץ: יש להגדיר סכום מראש ולא לחרוג ממנו.',
        },
        {
          // Clock-wise 01:30 on Oct 5, but belongs to Oct 4's nightlife plan.
          id: 'd6-la-siesta',
          startTime: '25:30',
          title: 'La Siesta',
          type: 'NIGHTLIFE',
          placeId: 'la-siesta-budapest',
          status: 'flexible',
          fixed: false,
          notes: 'לא מובטח. מומלץ רק אם יש עדיין אנרגיה בקבוצה — אם הקבוצה עייפה, מוטב לחזור למלון.',
        },
      ],
    },
    {
      id: 'day-7',
      date: '2026-10-05',
      dayNumber: 7,
      title: 'Departure',
      scheduleItems: [
        {
          id: 'd7-checkout',
          startTime: '07:30',
          title: 'צ׳ק-אאוט',
          type: 'HOTEL',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd7-airport-transfer',
          startTime: '07:45',
          title: 'נסיעה לשדה התעופה',
          type: 'TRANSPORT',
          status: 'confirmed',
          fixed: true,
        },
        {
          id: 'd7-flight',
          startTime: '11:30',
          title: 'טיסה הביתה',
          type: 'FLIGHT',
          status: 'confirmed',
          fixed: true,
        },
      ],
    },
  ],
};
