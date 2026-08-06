/** Hebrew strings (V1 default). Adding a locale = add a sibling dictionary with the same keys. */
export const he = {
  appName: 'ספר שכונה',
  loading: 'טוען…',
  phoneTitle: 'התחברות',
  phoneSubtitle: 'הזינו את מספר הטלפון הנייד שלכם ונשלח קוד אימות',
  phonePlaceholder: 'מספר טלפון (05X-XXXXXXX)',
  phoneCta: 'שליחת קוד אימות',
  otpTitle: 'אימות',
  otpSubtitle: 'הזינו את הקוד בן שש הספרות שנשלח אליכם',
  otpPlaceholder: 'קוד אימות',
  otpCta: 'אימות והתחברות',
  homeTitle: 'ברוכים הבאים',
  homeGreeting: 'שלום',
  homeProfileCta: 'הפרופיל שלי',
  homeLogout: 'התנתקות',
  profileTitle: 'הפרופיל שלי',
  profilePhone: 'טלפון',
  profileName: 'שם תצוגה',
  profileNamePlaceholder: 'הזינו שם תצוגה',
  profileSave: 'שמירה',
  profileSaved: 'הפרטים נשמרו בהצלחה',
  errorGeneric: 'אירעה שגיאה. נסו שוב.',
} as const;

export type StringKey = keyof typeof he;
