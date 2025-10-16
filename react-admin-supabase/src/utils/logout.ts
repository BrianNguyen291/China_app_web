import { supabase } from '../supabaseClient';

/**
 * Function logout đơn giản và hiệu quả
 */
export const performLogout = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    console.log('🚪 [LOGOUT] Starting logout process...');
    
    // Sign out từ Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ [LOGOUT] Supabase logout error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ [LOGOUT] Supabase logout successful');
    
    // Clear localStorage để đảm bảo session bị xóa
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies nếu có
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log('✅ [LOGOUT] All storage cleared');
    
    // KHÔNG redirect ở đây - để App.tsx auth listener xử lý
    
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ [LOGOUT] Unexpected error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Force logout - logout ngay cả khi có lỗi
 */
export const forceLogout = async (): Promise<void> => {
  try {
    console.log('🔨 [FORCE_LOGOUT] Force logout initiated...');
    
    // Thử logout từ Supabase
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('⚠️ [FORCE_LOGOUT] Supabase logout failed, continuing...', error);
  }
  
  // Clear tất cả storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
  
  // KHÔNG redirect ở đây - để App.tsx auth listener xử lý
  
  console.log('✅ [FORCE_LOGOUT] Force logout completed');
};
