import { supabase } from '../supabaseClient';

export type UserRoleData = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
};

export interface AuthResult {
  success: boolean;
  userData?: UserRoleData;
  error?: string;
  isAdmin?: boolean;
}

/**
 * Kiểm tra quyền admin của user hiện tại
 * @returns Promise<AuthResult>
 */
export const checkAdminRole = async (): Promise<AuthResult> => {
  try {
    console.log('🔍 [AUTH] Checking admin role...');
    
    // Lấy user hiện tại từ auth session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ [AUTH] Auth error:', authError);
      return {
        success: false,
        error: `Lỗi xác thực: ${authError.message}`
      };
    }

    if (!user) {
      console.warn('⚠️ [AUTH] No authenticated user');
      return {
        success: false,
        error: 'Không có user đăng nhập'
      };
    }

    console.log('👤 [AUTH] Authenticated user:', { 
      userId: user.id, 
      email: user.email 
    });

    // Lấy thông tin role từ database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', user.id)
      .maybeSingle();

    console.log('🔍 [AUTH] User data fetch result:', { 
      userId: user.id, 
      userData, 
      userError: userError?.message 
    });

    if (userError) {
      console.error('❌ [AUTH] Database error:', userError);
      return {
        success: false,
        error: `Lỗi cơ sở dữ liệu: ${userError.message}`
      };
    }

    if (!userData) {
      console.warn('⚠️ [AUTH] User not found in database:', { 
        email: user.email, 
        userId: user.id 
      });
      return {
        success: false,
        error: 'Tài khoản không tồn tại trong hệ thống'
      };
    }

    if (!userData.is_active) {
      console.warn('⚠️ [AUTH] User account is inactive:', { 
        email: userData.email, 
        userId: userData.id 
      });
      return {
        success: false,
        error: 'Tài khoản đã bị vô hiệu hóa'
      };
    }

    const isAdmin = userData.role === 'admin';
    
    console.log('👤 [AUTH] Role check result:', { 
      isAdmin, 
      role: userData.role, 
      isActive: userData.is_active,
      email: userData.email 
    });

    return {
      success: true,
      userData,
      isAdmin
    };

  } catch (error: any) {
    console.error('❌ [AUTH] Unexpected error:', error);
    return {
      success: false,
      error: error.message || 'Đã xảy ra lỗi không mong muốn'
    };
  }
};

/**
 * Kiểm tra quyền admin của user cụ thể bằng ID
 * @param userId - ID của user cần kiểm tra
 * @returns Promise<AuthResult>
 */
export const checkUserRole = async (userId: string): Promise<AuthResult> => {
  try {
    console.log('🔍 [AUTH] Checking user role for ID:', userId);
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('❌ [AUTH] Database error:', userError);
      return {
        success: false,
        error: `Lỗi cơ sở dữ liệu: ${userError.message}`
      };
    }

    if (!userData) {
      return {
        success: false,
        error: 'User không tồn tại trong hệ thống'
      };
    }

    const isAdmin = userData.role === 'admin';
    
    return {
      success: true,
      userData,
      isAdmin
    };

  } catch (error: any) {
    console.error('❌ [AUTH] Unexpected error:', error);
    return {
      success: false,
      error: error.message || 'Đã xảy ra lỗi không mong muốn'
    };
  }
};

/**
 * Lấy danh sách tất cả users với thông tin role
 * @returns Promise<UserRoleData[]>
 */
export const getAllUsersWithRoles = async (): Promise<UserRoleData[]> => {
  try {
    console.log('🔍 [AUTH] Fetching all users with roles...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [AUTH] Error fetching users:', error);
      throw error;
    }

    console.log('✅ [AUTH] Fetched users:', users?.length || 0);
    return users || [];

  } catch (error: any) {
    console.error('❌ [AUTH] Error fetching users:', error);
    throw error;
  }
};

/**
 * Cấp quyền admin cho user
 * @param userId - ID của user cần cấp quyền
 * @returns Promise<boolean>
 */
export const grantAdminRole = async (userId: string): Promise<boolean> => {
  try {
    console.log('🔑 [AUTH] Granting admin role to user:', userId);
    
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ [AUTH] Error granting admin role:', error);
      return false;
    }

    console.log('✅ [AUTH] Admin role granted successfully');
    return true;

  } catch (error: any) {
    console.error('❌ [AUTH] Error granting admin role:', error);
    return false;
  }
};

/**
 * Thu hồi quyền admin của user (chuyển về user thường)
 * @param userId - ID của user cần thu hồi quyền
 * @returns Promise<boolean>
 */
export const revokeAdminRole = async (userId: string): Promise<boolean> => {
  try {
    console.log('🔓 [AUTH] Revoking admin role from user:', userId);
    
    const { error } = await supabase
      .from('users')
      .update({ role: 'user' })
      .eq('id', userId);

    if (error) {
      console.error('❌ [AUTH] Error revoking admin role:', error);
      return false;
    }

    console.log('✅ [AUTH] Admin role revoked successfully');
    return true;

  } catch (error: any) {
    console.error('❌ [AUTH] Error revoking admin role:', error);
    return false;
  }
};
