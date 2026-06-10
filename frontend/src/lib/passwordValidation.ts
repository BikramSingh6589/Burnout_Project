export const getPasswordRequirementError = (password: string): string | null => {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 capital letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least 1 lowercase letter.';
  if (!/\d/.test(password)) return 'Password must contain at least 1 number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least 1 special character.';
  return null;
};
