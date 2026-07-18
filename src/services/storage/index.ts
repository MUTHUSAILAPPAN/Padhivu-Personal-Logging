// Browser session cache and persistent metadata storage helper

export const getCachedSession = (): boolean => {
  return sessionStorage.getItem('padhivu_workbook_active') === 'true';
};

export const clearSession = (): void => {
  sessionStorage.removeItem('padhivu_workbook_active');
  localStorage.removeItem('padhivu_last_filename');
};
