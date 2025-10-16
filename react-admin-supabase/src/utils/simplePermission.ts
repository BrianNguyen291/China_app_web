import { supabase } from '../supabaseClient';

/**
 * Kiểm tra quyền admin đơn giản với timeout ngắn
 */
export const simpleCheckAdmin = async (): Promise<{
  isAdmin: boolean;
  userEmail?: string;
  error?: string;
}> => {
  try {
    console.log('🔍 [SIMPLE_PERMISSION] Quick admin check...');
    
    // Timeout ngắn để tránh treo
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 3000);
    });
    
    const checkPromise = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { isAdmin: false, error: 'No user' };
      }

      // Query đơn giản với timeout
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('email, role, is_active')
        .eq('id', user.id)
        .single();

      if (dbError || !userData) {
        return { isAdmin: false, error: 'DB error' };
      }

      const isAdmin = userData.role === 'admin' && userData.is_active === true;
      
      return {
        isAdmin: isAdmin,
        userEmail: userData.email
      };
    };

    return await Promise.race([checkPromise(), timeoutPromise]) as any;

  } catch (error: any) {
    console.error('❌ [SIMPLE_PERMISSION] Error:', error);
    return { 
      isAdmin: false, 
      error: error.message || 'Permission check failed' 
    };
  }
};

/**
 * Bypass permission check - chỉ check user có tồn tại không
 */
export const bypassPermissionCheck = async (): Promise<{
  isAdmin: boolean;
  userEmail?: string;
  error?: string;
}> => {
  try {
    console.log('🚨 [BYPASS] Bypassing permission check...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isAdmin: false, error: 'No user' };
    }

    // Luôn trả về true nếu có user (bypass check)
    return {
      isAdmin: true,
      userEmail: user.email || 'Unknown'
    };

  } catch (error: any) {
    console.error('❌ [BYPASS] Error:', error);
    return { 
      isAdmin: false, 
      error: error.message 
    };
  }
};

