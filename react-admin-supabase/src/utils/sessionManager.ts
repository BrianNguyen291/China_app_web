import { supabase } from '../supabaseClient';
import { checkAdminPermission } from './checkPermission';

export interface SessionState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  loading: boolean;
  error?: string;
}

/**
 * Kiểm tra session hiện tại và quyền admin
 */
export const checkCurrentSession = async (): Promise<SessionState> => {
  try {
    console.log('🔍 [SESSION] Checking current session...');
    
    // Kiểm tra session từ Supabase trực tiếp - không có timeout
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [SESSION] Session error:', sessionError);
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: false,
        error: sessionError.message
      };
    }

    if (!session || !session.user) {
      console.log('👤 [SESSION] No active session found');
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: false
      };
    }

    console.log('✅ [SESSION] Active session found:', {
      userId: session.user.id,
      email: session.user.email
    });

    // Kiểm tra quyền admin trực tiếp
    const permissionResult = await checkAdminPermission();
    
    if (permissionResult.error) {
      console.error('❌ [SESSION] Permission check failed:', permissionResult.error);
      return {
        isAuthenticated: true,
        isAdmin: false,
        user: session.user,
        loading: false,
        error: permissionResult.error
      };
    }

    console.log('📋 [SESSION] Permission result:', {
      isAdmin: permissionResult.isAdmin,
      userEmail: permissionResult.userEmail
    });

    return {
      isAuthenticated: true,
      isAdmin: permissionResult.isAdmin,
      user: session.user,
      loading: false
    };

  } catch (error: any) {
    console.error('❌ [SESSION] Unexpected error:', error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      loading: false,
      error: error.message
    };
  }
};

/**
 * Setup auth state listener
 */
export const setupAuthListener = (onAuthStateChange: (sessionState: SessionState) => void) => {
  console.log('🔗 [SESSION] Setting up auth listener...');
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 [SESSION] Auth state changed:', { event, session: !!session });
    
    if (event === 'SIGNED_IN' && session) {
      console.log('✅ [SESSION] User signed in, checking permissions...');
      
      // Kiểm tra quyền admin
      const permissionResult = await checkAdminPermission();
      
      if (permissionResult.isAdmin) {
        console.log('🎉 [SESSION] Admin user authenticated');
        onAuthStateChange({
          isAuthenticated: true,
          isAdmin: true,
          user: session.user,
          loading: false
        });
      } else {
        console.warn('⚠️ [SESSION] Non-admin user signed in, signing out');
        await supabase.auth.signOut();
        onAuthStateChange({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          loading: false,
          error: 'Chỉ quản trị viên mới có thể truy cập'
        });
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 [SESSION] User signed out');
      onAuthStateChange({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: false
      });
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 [SESSION] Token refreshed');
      // Re-check session after token refresh
      const sessionState = await checkCurrentSession();
      onAuthStateChange(sessionState);
    }
  });

  return subscription;
};

/**
 * Redirect based on session state
 */
export const handleSessionRedirect = (sessionState: SessionState): string => {
  if (sessionState.loading) {
    return '/'; // Stay on current page while loading
  }
  
  if (sessionState.isAuthenticated && sessionState.isAdmin) {
    return '/dashboard'; // Redirect to dashboard if admin
  }
  
  return '/login'; // Redirect to login if not authenticated or not admin
};
