/**
 * Simple logout function - không async để tránh vòng lặp
 */
export const simpleLogout = (): void => {
  console.log('🚪 [SIMPLE_LOGOUT] Simple logout initiated');
  
  try {
    // Clear tất cả storage trước
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log('✅ [SIMPLE_LOGOUT] Storage cleared');
    
    // Force redirect
    window.location.href = '/login';
    
  } catch (error) {
    console.error('❌ [SIMPLE_LOGOUT] Error:', error);
    // Force redirect anyway
    window.location.href = '/login';
  }
};

/**
 * Emergency logout - clear everything and redirect
 */
export const emergencyLogout = (): void => {
  console.log('🚨 [EMERGENCY_LOGOUT] Emergency logout initiated');
  
  try {
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Force redirect
    window.location.href = '/login';
    
  } catch (error) {
    console.error('❌ [EMERGENCY_LOGOUT] Error:', error);
    window.location.href = '/login';
  }
};

