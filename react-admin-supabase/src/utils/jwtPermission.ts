import { supabase } from '../supabaseClient';
import { getCurrentJWTUser, getCurrentJWTToken, isCurrentJWTSessionValid } from './jwtAuthManager';
import { verifyJWTToken } from './jwtAuth';

/**
 * Kiểm tra quyền admin với JWT - không cần Supabase Auth
 */
export const checkJWTAdminPermission = async (): Promise<{
  isAdmin: boolean;
  userEmail?: string;
  error?: string;
}> => {
  try {
    console.log('🔍 [JWT_PERMISSION] Checking JWT admin permission...');
    
    // Check JWT session validity
    if (!isCurrentJWTSessionValid()) {
      console.error('❌ [JWT_PERMISSION] JWT session invalid');
      return { 
        isAdmin: false, 
        error: 'JWT session không hợp lệ hoặc đã hết hạn' 
      };
    }

    // Get current user from JWT
    const user = getCurrentJWTUser();
    const token = getCurrentJWTToken();
    
    if (!user || !token) {
      console.error('❌ [JWT_PERMISSION] No user or token found');
      return { 
        isAdmin: false, 
        error: 'Không tìm thấy thông tin user hoặc token' 
      };
    }

    console.log('👤 [JWT_PERMISSION] Checking user from JWT:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Verify token với server (optional check)
    try {
      const verifiedUser = await verifyJWTToken(token);
      if (!verifiedUser) {
        console.warn('⚠️ [JWT_PERMISSION] Token verification failed, but continuing with local data');
      } else {
        console.log('✅ [JWT_PERMISSION] Token verified with server');
      }
    } catch (error) {
      console.warn('⚠️ [JWT_PERMISSION] Could not verify token with server, using local data');
    }

    // Kiểm tra role từ JWT payload
    const isAdmin = user.role === 'admin' && user.is_active === true;
    
    console.log('📋 [JWT_PERMISSION] Result:', {
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      isAdmin: isAdmin
    });

    return {
      isAdmin: isAdmin,
      userEmail: user.email
    };

  } catch (error: any) {
    console.error('❌ [JWT_PERMISSION] Unexpected error:', error);
    return { 
      isAdmin: false, 
      error: error.message 
    };
  }
};

/**
 * Kiểm tra quyền cho một user cụ thể bằng ID
 */
export const checkJWTUserPermission = async (userId: string): Promise<{
  isAdmin: boolean;
  userEmail?: string;
  error?: string;
}> => {
  try {
    console.log('🔍 [JWT_PERMISSION] Checking JWT permission for user ID:', userId);
    
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('email, role, is_active')
      .eq('id', userId)
      .single();

    if (dbError) {
      console.error('❌ [JWT_PERMISSION] Database error:', dbError);
      return { 
        isAdmin: false, 
        error: `Lỗi database: ${dbError.message}` 
      };
    }

    if (!userData) {
      console.error('❌ [JWT_PERMISSION] User not found');
      return { 
        isAdmin: false, 
        error: 'User không tồn tại' 
      };
    }

    const isAdmin = userData.role === 'admin' && userData.is_active === true;
    
    console.log('📋 [JWT_PERMISSION] User permission result:', {
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
    console.error('❌ [JWT_PERMISSION] Unexpected error:', error);
    return { 
      isAdmin: false, 
      error: error.message 
    };
  }
};

/**
 * Kiểm tra quyền admin cho email cụ thể
 */
export const checkJWTAdminByEmail = async (email: string): Promise<{
  isAdmin: boolean;
  userId?: string;
  error?: string;
}> => {
  try {
    console.log('🔍 [JWT_PERMISSION] Checking JWT admin permission for email:', email);
    
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('email', email)
      .single();

    if (dbError) {
      console.error('❌ [JWT_PERMISSION] Database error:', dbError);
      return { 
        isAdmin: false, 
        error: `Lỗi database: ${dbError.message}` 
      };
    }

    if (!userData) {
      console.error('❌ [JWT_PERMISSION] User not found for email:', email);
      return { 
        isAdmin: false, 
        error: 'User không tồn tại với email này' 
      };
    }

    const isAdmin = userData.role === 'admin' && userData.is_active === true;
    
    console.log('📋 [JWT_PERMISSION] Email permission result:', {
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
    console.error('❌ [JWT_PERMISSION] Unexpected error:', error);
    return { 
      isAdmin: false, 
      error: error.message 
    };
  }
};

/**
 * Kiểm tra quyền admin hiện tại từ JWT store (nhanh nhất)
 */
export const isCurrentUserAdmin = (): boolean => {
  try {
    const user = getCurrentJWTUser();
    if (!user) return false;
    
    return user.role === 'admin' && user.is_active === true;
  } catch (error) {
    console.error('❌ [JWT_PERMISSION] Error checking current user admin status:', error);
    return false;
  }
};

/**
 * Lấy thông tin user hiện tại từ JWT
 */
export const getCurrentUserInfo = () => {
  return getCurrentJWTUser();
};

