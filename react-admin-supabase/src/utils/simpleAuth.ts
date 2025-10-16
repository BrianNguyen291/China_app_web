import { supabase } from '../supabaseClient';
import { 
  useAuthStore, 
  getAuthState, 
  setAuthLoading, 
  setAuthError, 
  loginUser, 
  logoutUser, 
  isSessionValid,
  type SimpleUser 
} from '../store/authStore';

export interface SimpleAuthState {
  isAuthenticated: boolean;
  user: SimpleUser | null;
  loading: boolean;
  error?: string;
}

/**
 * Đăng nhập đơn giản - chỉ check bảng users với role admin
 */
export const simpleLogin = async (email: string, password: string): Promise<{
  success: boolean;
  user?: SimpleUser;
  error?: string;
}> => {
  try {
    console.log('🔐 [SIMPLE_AUTH] Login attempt for:', email);

    // Bước 1: Đăng nhập qua Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('❌ [SIMPLE_AUTH] Auth failed:', authError);
      return {
        success: false,
        error: authError?.message || 'Đăng nhập thất bại'
      };
    }

    console.log('✅ [SIMPLE_AUTH] Auth successful, checking user table...');

    // Bước 2: Check bảng users với role admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      console.error('❌ [SIMPLE_AUTH] User check failed:', userError);
      // Logout khỏi Supabase auth nếu không phải admin
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Tài khoản không có quyền admin hoặc đã bị khóa'
      };
    }

    // Bước 3: Cập nhật last_login_at
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userData.id);

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

    // Store user trong Zustand store
    loginUser(user);

    console.log('🎉 [SIMPLE_AUTH] Login successful for admin:', userData.email);

    return {
      success: true,
      user: user
    };

  } catch (error: any) {
    console.error('❌ [SIMPLE_AUTH] Unexpected error:', error);
    return {
      success: false,
      error: error.message || 'Lỗi không xác định'
    };
  }
};

/**
 * Đăng xuất đơn giản - xóa session trên Supabase và store
 */
export const simpleLogout = async (): Promise<void> => {
  try {
    console.log('🚪 [SIMPLE_AUTH] Logging out...');
    
    // Logout khỏi Supabase (xóa session trên server)
    await supabase.auth.signOut();
    
    // Clear Zustand store
    logoutUser();
    
    console.log('✅ [SIMPLE_AUTH] Logout successful - cleared both Supabase and store');
  } catch (error) {
    console.error('❌ [SIMPLE_AUTH] Logout error:', error);
    
    // Fallback: clear store even if Supabase logout fails
    logoutUser();
  }
};

/**
 * Clear session chỉ trong store (không logout Supabase)
 */
export const clearLocalSession = (): void => {
  try {
    console.log('🧹 [SIMPLE_AUTH] Clearing store session only...');
    logoutUser();
    console.log('✅ [SIMPLE_AUTH] Store session cleared');
  } catch (error) {
    console.error('❌ [SIMPLE_AUTH] Clear store session error:', error);
  }
};

/**
 * Kiểm tra session hiện tại - ưu tiên store để giữ session khi reload
 */
export const checkSimpleSession = async (): Promise<SimpleAuthState> => {
  try {
    console.log('🔍 [SIMPLE_AUTH] Checking session...');

    // Check store trước - ưu tiên để giữ session khi reload
    const storeState = getAuthState();
    
    if (storeState.isAuthenticated && storeState.user && isSessionValid()) {
      console.log('📱 [SIMPLE_AUTH] Found valid store session:', storeState.user.email);
      
      // Verify Supabase session is still active (optional check)
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          console.log('⚠️ [SIMPLE_AUTH] Supabase session expired, but keeping store session');
          // Không logout khỏi store, chỉ log warning
        } else {
          console.log('✅ [SIMPLE_AUTH] Supabase session also active');
        }
      } catch (error) {
        console.log('⚠️ [SIMPLE_AUTH] Could not verify Supabase session, keeping store session');
      }
      
      return {
        isAuthenticated: true,
        user: storeState.user,
        loading: false
      };
    }

    // Check Supabase session nếu không có store session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.log('👤 [SIMPLE_AUTH] No active Supabase session');
      return {
        isAuthenticated: false,
        user: null,
        loading: false
      };
    }

    // Verify user trong bảng users với role admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      console.error('❌ [SIMPLE_AUTH] User verification failed:', userError);
      // Không logout khỏi Supabase, chỉ clear store
      logoutUser();
      return {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'User không có quyền admin'
      };
    }

    const user: SimpleUser = {
      id: userData.id,
      email: userData.email,
      display_name: userData.display_name,
      role: userData.role,
      is_active: userData.is_active,
      created_at: userData.created_at,
      last_login_at: userData.last_login_at,
      level: userData.level
    };

    // Store user trong store
    loginUser(user);

    console.log('✅ [SIMPLE_AUTH] Session restored for admin:', user.email);

    return {
      isAuthenticated: true,
      user: user,
      loading: false
    };

  } catch (error: any) {
    console.error('❌ [SIMPLE_AUTH] Session check error:', error);
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: error.message
    };
  }
};

/**
 * Setup auth listener đơn giản
 */
export const setupSimpleAuthListener = (onAuthChange: (state: SimpleAuthState) => void) => {
  console.log('🔗 [SIMPLE_AUTH] Setting up simple auth listener...');
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 [SIMPLE_AUTH] Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session) {
      console.log('✅ [SIMPLE_AUTH] User signed in, verifying...');
      
      // Verify user có role admin không
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .single();

      if (error || !userData) {
        console.warn('⚠️ [SIMPLE_AUTH] Non-admin user signed in, signing out');
        await supabase.auth.signOut();
        logoutUser();
        onAuthChange({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Chỉ admin mới có thể truy cập'
        });
      } else {
        const user: SimpleUser = {
          id: userData.id,
          email: userData.email,
          display_name: userData.display_name,
          role: userData.role,
          is_active: userData.is_active,
          created_at: userData.created_at,
          last_login_at: userData.last_login_at,
          level: userData.level
        };
        
        loginUser(user);
        onAuthChange({
          isAuthenticated: true,
          user: user,
          loading: false
        });
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 [SIMPLE_AUTH] User signed out from Supabase');
      // Chỉ clear store, không cần thông báo lại vì user có thể vẫn có session local
      logoutUser();
      onAuthChange({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 [SIMPLE_AUTH] Token refreshed, keeping local session');
      // Không cần làm gì, giữ nguyên local session
    }
  });

  return subscription;
};
