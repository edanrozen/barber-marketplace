/** OTP code format validation. */
export const OTP_LENGTH = 6;
const OTP_RE = new RegExp(`^\\d{${OTP_LENGTH}}$`);
export const isValidOtpCode = (code: string): boolean => typeof code === 'string' && OTP_RE.test(code);
