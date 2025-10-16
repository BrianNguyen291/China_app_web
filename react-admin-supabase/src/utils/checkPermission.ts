import { supabase } from '../supabaseClient';

/**
 * Kiểm tra quyền admin đơn giản - chỉ check role trong database
 */
export const checkAdminPermission = async (): Promise<{
  isAdmin: boolean;
  userEmail?: string;
  error?: string;
}> => {
  try {
    console.log('🔍 [PERMISSION] Checking admin permission...');
    
    // Lấy user hiện tại từ auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ [PERMISSION] Auth error:', authError);
      return { 
        isAdmin: false, 
        error: 'Không có user đăng nhập' 
      };
    }

    console.log('👤 [PERMISSION] Checking user:', {
      id: user.id,
      email: user.email
    });

    // Query trực tiếp để check role
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('email, role, is_active')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('❌ [PERMISSION] Database error:', dbError);
      return { 
        isAdmin: false, 
        error: `Lỗi database: ${dbError.message}` 
      };
    }

    if (!userData) {
      console.error('❌ [PERMISSION] User not found in database');
      return { 
        isAdmin: false, 
        error: 'User không tồn tại trong database' 
      };
    }

    // Kiểm tra role
    const isAdmin = userData.role === 'admin' && userData.is_active === true;
    
    console.log('📋 [PERMISSION] Result:', {
      email: userData.email,
      role: userData.role,
      isActive: userData.is_active,
      isAdmin: isAdmin
    });

    return {
      isAdmin: isAdmin,
      userEmail: userData.email
    };

  } catch (error: any) {
    console.error('❌ [PERMISSION] Unexpected error:', error);
    return { 
      isAdmin: false, 
      error: error.message 
    };
  }
};

/**
 * Kiểm tra quyền cho một user cụ thể
 */
export const checkUserPermission = async (userId: string): Promise<{
  isAdmin: boolean;
  userEmail?: string;
  error?: string;
}> => {
  try {
    console.log('🔍 [PERMISSION] Checking permission for user ID:', userId);
    
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('email, role, is_active')
      .eq('id', userId)
      .single();

    if (dbError) {
      console.error('❌ [PERMISSION] Database error:', dbError);
      return { 
        isAdmin: false, 
        error: `Lỗi database: ${dbError.message}` 
      };
    }

    if (!userData) {
      console.error('❌ [PERMISSION] User not found');
      return { 
        isAdmin: false, 
        error: 'User không tồn tại' 
      };
    }

    const isAdmin = userData.role === 'admin' && userData.is_active === true;
    
    console.log('📋 [PERMISSION] User permission result:', {
      email: userData.email,
      role: userData.role,
      isActive: userData.is_active,
      isAdmin: isAdmin
    });

    return {
      isAdmin: isAdmin,
      userEmail: userData.email
    };

  } catch (error: any) {
    console.error('❌ [PERMISSION] Unexpected error:', error);
    return { 
      isAdmin: false, 
      error: error.message 
    };
  }
};

/**
 * Kiểm tra quyền admin cho email cụ thể
 */
export const checkAdminByEmail = async (email: string): Promise<{
  isAdmin: boolean;
  userId?: string;
  error?: string;
}> => {
  try {
    console.log('🔍 [PERMISSION] Checking admin permission for email:', email);
    
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('email', email)
      .single();

    if (dbError) {
      console.error('❌ [PERMISSION] Database error:', dbError);
      return { 
        isAdmin: false, 
        error: `Lỗi database: ${dbError.message}` 
      };
    }

    if (!userData) {
      console.error('❌ [PERMISSION] User not found for email:', email);
      return { 
        isAdmin: false, 
        error: 'User không tồn tại với email này' 
      };
    }

    const isAdmin = userData.role === 'admin' && userData.is_active === true;
    
    console.log('📋 [PERMISSION] Email permission result:', {
      email: userData.email,
      role: userData.role,
      isActive: userData.is_active,
      isAdmin: isAdmin
    });

    return {
      isAdmin: isAdmin,
      userId: userData.id
    };

  } catch (error: any) {
    console.error('❌ [PERMISSION] Unexpected error:', error);
    return { 
      isAdmin: false, 
      error: error.message 
    };
  }
};

