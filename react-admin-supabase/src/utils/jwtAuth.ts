import { supabase } from '../supabaseClient';
import type { SimpleUser } from '../store/authStore';

export interface LoginResponse {
  success: boolean;
  user?: SimpleUser;
  token?: string;
  error?: string;
}

/**
 * JWT Login - đăng nhập với Supabase Auth và lấy JWT token
 */
export const jwtLogin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('🔐 [JWT_AUTH] Login attempt for:', email);

    // Bước 1: Đăng nhập với Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      console.error('❌ [JWT_AUTH] Auth failed:', authError);
      return {
        success: false,
        error: authError?.message || 'Đăng nhập thất bại'
      };
    }

    console.log('✅ [JWT_AUTH] Supabase Auth successful, checking user table...');

    // Bước 2: Check bảng users với role admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      console.error('❌ [JWT_AUTH] User check failed:', userError);
      // Logout khỏi Supabase auth nếu không phải admin
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Tài khoản không có quyền admin hoặc đã bị khóa'
      };
    }

    // Bước 3: Tạo user object
    const user: SimpleUser = {
      id: userData.id,
      email: userData.email,
      display_name: userData.display_name,
      role: userData.role,
      is_active: userData.is_active,
      created_at: userData.created_at,
      last_login_at: new Date().toISOString(),
      level: userData.level
    };

    // Bước 4: Sử dụng Supabase JWT token (đã có sẵn từ session)
    const token = authData.session.access_token;

    // Bước 5: Cập nhật last_login_at
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userData.id);

    console.log('🎉 [JWT_AUTH] JWT login successful for admin:', userData.email);

    return {
      success: true,
      user: user,
      token: token
    };

  } catch (error: any) {
    console.error('❌ [JWT_AUTH] Unexpected error:', error);
    return {
      success: false,
      error: error.message || 'Lỗi không xác định'
    };
  }
};

/**
 * Verify JWT token và lấy user info từ Supabase
 */
export const verifyJWTToken = async (token: string): Promise<SimpleUser | null> => {
  try {
    console.log('🔍 [JWT_AUTH] Verifying JWT token with Supabase...');

    // Sử dụng Supabase để verify token
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      console.error('❌ [JWT_AUTH] Token verification failed:', userError);
      return null;
    }

    // Get user data from database
    const { data: dbUserData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.user.id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (dbError || !dbUserData) {
      console.error('❌ [JWT_AUTH] User not found or inactive:', dbError);
      return null;
    }

    const user: SimpleUser = {
      id: dbUserData.id,
      email: dbUserData.email,
      display_name: dbUserData.display_name,
      role: dbUserData.role,
      is_active: dbUserData.is_active,
      created_at: dbUserData.created_at,
      last_login_at: dbUserData.last_login_at,
      level: dbUserData.level
    };

    console.log('✅ [JWT_AUTH] JWT token verified for user:', user.email);
    return user;

  } catch (error: any) {
    console.error('❌ [JWT_AUTH] Token verification error:', error);
    return null;
  }
};

/**
 * Refresh JWT token sử dụng Supabase
 */
export const refreshJWTToken = async (token: string): Promise<string | null> => {
  try {
    console.log('🔄 [JWT_AUTH] Refreshing JWT token with Supabase...');

    // Supabase tự động refresh token, chỉ cần lấy session hiện tại
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.error('❌ [JWT_AUTH] Failed to get session:', sessionError);
      return null;
    }

    console.log('✅ [JWT_AUTH] JWT token refreshed');
    return sessionData.session.access_token;

  } catch (error: any) {
    console.error('❌ [JWT_AUTH] Token refresh error:', error);
    return null;
  }
};

/**
 * JWT Logout - logout khỏi Supabase Auth
 */
export const jwtLogout = async (): Promise<void> => {
  try {
    console.log('🚪 [JWT_AUTH] Logging out from Supabase...');
    await supabase.auth.signOut();
    console.log('✅ [JWT_AUTH] JWT logout successful');
  } catch (error) {
    console.error('❌ [JWT_AUTH] Logout error:', error);
  }
};

/**
 * Check if JWT token is expired
 */
export const isJWTExpired = (token: string): boolean => {
  try {
    // Decode JWT payload để check expiration
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp < now;
  } catch (error) {
    console.error('❌ [JWT_AUTH] Error checking token expiration:', error);
    return true;
  }
};

/**
 * Verify JWT token locally (không gọi server)
 */
export const verifyJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch (error) {
    console.error('❌ [JWT_AUTH] Token verification failed:', error);
    return null;
  }
};

/**
 * Get JWT payload without verification (for debugging)
 */
export const getJWTPayload = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('❌ [JWT_AUTH] Failed to decode payload:', error);
    return null;
  }
};