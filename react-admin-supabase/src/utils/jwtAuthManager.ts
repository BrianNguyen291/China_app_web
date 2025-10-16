import { jwtLogin, verifyJWTToken, refreshJWTToken, jwtLogout, isJWTExpired } from './jwtAuth';
import { 
  getAuthState, 
  setAuthLoading, 
  setAuthError, 
  loginUser, 
  logoutUser, 
  isSessionValid,
  isTokenValid,
  type SimpleUser 
} from '../store/authStore';

export interface JWTAuthState {
  isAuthenticated: boolean;
  user: SimpleUser | null;
  loading: boolean;
  error?: string;
}

/**
 * JWT Login wrapper cho store
 */
export const jwtLoginWithStore = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔐 [JWT_MANAGER] Starting JWT login...', { 
      email, 
      passwordLength: password.length,
      timestamp: new Date().toISOString()
    });
    
    setAuthLoading(true);
    setAuthError(null);

    // Debug store state trước khi login
    const storeStateBefore = getAuthState();
    console.log('🏪 [JWT_MANAGER] Store state before login:', {
      isAuthenticated: storeStateBefore.isAuthenticated,
      hasUser: !!storeStateBefore.user,
      hasToken: !!storeStateBefore.token,
      loading: storeStateBefore.loading,
      error: storeStateBefore.error
    });

    console.log('🔄 [JWT_MANAGER] Calling jwtLogin...');
    const result = await jwtLogin(email, password);
    
    console.log('📋 [JWT_MANAGER] jwtLogin result:', result);
    
    if (!result.success) {
      console.error('❌ [JWT_MANAGER] JWT login failed:', result.error);
      setAuthError(result.error || 'Đăng nhập thất bại');
      return { success: false, error: result.error };
    }

    if (result.user && result.token) {
      console.log('🔄 [JWT_MANAGER] Storing user and token in store...', {
        userId: result.user.id,
        userEmail: result.user.email,
        userRole: result.user.role,
        tokenLength: result.token.length,
        tokenPreview: result.token.substring(0, 50) + '...'
      });
      
      // Store user và token trong store
      loginUser(result.user, result.token);
      
      // Debug store state sau khi login
      const storeStateAfter = getAuthState();
      console.log('🏪 [JWT_MANAGER] Store state after login:', {
        isAuthenticated: storeStateAfter.isAuthenticated,
        hasUser: !!storeStateAfter.user,
        hasToken: !!storeStateAfter.token,
        userEmail: storeStateAfter.user?.email,
        userRole: storeStateAfter.user?.role,
        loading: storeStateAfter.loading,
        error: storeStateAfter.error
      });
      
      console.log('🎉 [JWT_MANAGER] JWT login successful:', result.user.email);
      return { success: true };
    }

    console.error('❌ [JWT_MANAGER] Missing user or token in result:', result);
    return { success: false, error: 'Không nhận được thông tin user hoặc token' };

  } catch (error: any) {
    console.error('❌ [JWT_MANAGER] JWT login error:', error);
    console.error('❌ [JWT_MANAGER] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    setAuthError(error.message || 'Đã xảy ra lỗi khi đăng nhập');
    return { success: false, error: error.message };
  }
};

/**
 * JWT Logout wrapper cho store
 */
export const jwtLogoutWithStore = async (): Promise<void> => {
  try {
    console.log('🚪 [JWT_MANAGER] Starting JWT logout...');
    
    // JWT logout với Supabase
    await jwtLogout();
    
    // Clear store
    logoutUser();
    
    console.log('✅ [JWT_MANAGER] JWT logout successful');
  } catch (error) {
    console.error('❌ [JWT_MANAGER] JWT logout error:', error);
    // Fallback: clear store even if logout fails
    logoutUser();
  }
};

/**
 * Clear local session (chỉ xóa store, không logout server)
 */
export const clearJWTLocalSession = (): void => {
  try {
    console.log('🧹 [JWT_MANAGER] Clearing JWT local session...');
    logoutUser();
    console.log('✅ [JWT_MANAGER] JWT local session cleared');
  } catch (error) {
    console.error('❌ [JWT_MANAGER] Clear JWT local session error:', error);
  }
};

/**
 * Kiểm tra JWT session hiện tại
 */
export const checkJWTSession = async (): Promise<JWTAuthState> => {
  try {
    console.log('🔍 [JWT_MANAGER] Checking JWT session...');

    // Check store trước
    const storeState = getAuthState();
    console.log('🏪 [JWT_MANAGER] Store state:', {
      isAuthenticated: storeState.isAuthenticated,
      hasUser: !!storeState.user,
      hasToken: !!storeState.token,
      userEmail: storeState.user?.email,
      userRole: storeState.user?.role,
      sessionTime: storeState.sessionTime
    });
    
    if (storeState.isAuthenticated && storeState.user && storeState.token) {
      console.log('🔍 [JWT_MANAGER] Found user and token in store, checking validity...');
      
      // Check session validity
      const sessionValid = isSessionValid();
      const tokenValid = isTokenValid();
      
      console.log('🔍 [JWT_MANAGER] Validity checks:', {
        sessionValid: sessionValid,
        tokenValid: tokenValid,
        sessionTime: storeState.sessionTime,
        currentTime: Date.now(),
        timeDiff: storeState.sessionTime ? Date.now() - storeState.sessionTime : 'N/A'
      });
      
      if (sessionValid && tokenValid) {
        console.log('📱 [JWT_MANAGER] Found valid JWT session:', storeState.user.email);
        
        // Optional: Verify token với server (để đảm bảo user vẫn active)
        try {
          console.log('🔄 [JWT_MANAGER] Verifying JWT token with server...');
          const verifiedUser = await verifyJWTToken(storeState.token);
          if (verifiedUser) {
            console.log('✅ [JWT_MANAGER] JWT token verified with server');
            return {
              isAuthenticated: true,
              user: verifiedUser,
              loading: false
            };
          } else {
            console.log('⚠️ [JWT_MANAGER] JWT token verification failed, but keeping local session');
            return {
              isAuthenticated: true,
              user: storeState.user,
              loading: false
            };
          }
        } catch (error) {
          console.log('⚠️ [JWT_MANAGER] Could not verify JWT with server, keeping local session');
          console.log('⚠️ [JWT_MANAGER] Verification error:', error);
          return {
            isAuthenticated: true,
            user: storeState.user,
            loading: false
          };
        }
      } else {
        console.log('⏰ [JWT_MANAGER] JWT session or token expired, clearing...');
        console.log('⏰ [JWT_MANAGER] Expiry reasons:', {
          sessionValid: sessionValid,
          tokenValid: tokenValid
        });
        logoutUser();
      }
    } else {
      console.log('👤 [JWT_MANAGER] No user or token found in store');
      console.log('👤 [JWT_MANAGER] Missing components:', {
        isAuthenticated: storeState.isAuthenticated,
        hasUser: !!storeState.user,
        hasToken: !!storeState.token
      });
    }

    console.log('👤 [JWT_MANAGER] No valid JWT session found');
    return {
      isAuthenticated: false,
      user: null,
      loading: false
    };

  } catch (error: any) {
    console.error('❌ [JWT_MANAGER] JWT session check error:', error);
    console.error('❌ [JWT_MANAGER] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: error.message
    };
  }
};

/**
 * Refresh JWT token nếu cần
 */
export const refreshJWTSession = async (): Promise<boolean> => {
  try {
    const storeState = getAuthState();
    
    if (!storeState.token || !storeState.user) {
      console.log('👤 [JWT_MANAGER] No token or user to refresh');
      return false;
    }

    // Check if token needs refresh (expires in next hour)
    if (!isJWTExpired(storeState.token)) {
      console.log('✅ [JWT_MANAGER] Token still valid, no refresh needed');
      return true;
    }

    console.log('🔄 [JWT_MANAGER] Refreshing JWT token with Supabase...');
    
    const newToken = await refreshJWTToken(storeState.token);
    
    if (newToken) {
      // Update store với new token
      loginUser(storeState.user, newToken);
      console.log('✅ [JWT_MANAGER] JWT token refreshed successfully');
      return true;
    } else {
      console.log('❌ [JWT_MANAGER] Failed to refresh JWT token');
      logoutUser();
      return false;
    }

  } catch (error: any) {
    console.error('❌ [JWT_MANAGER] JWT token refresh error:', error);
    logoutUser();
    return false;
  }
};

/**
 * Setup JWT auth listener (không cần vì JWT stateless)
 */
export const setupJWTAuthListener = (onAuthChange: (state: JWTAuthState) => void) => {
  console.log('🔗 [JWT_MANAGER] JWT auth is stateless, no listener needed');
  
  // JWT là stateless nên không cần listener như Supabase Auth
  // Chỉ cần return empty subscription
  return {
    unsubscribe: () => {
      console.log('🧹 [JWT_MANAGER] JWT auth listener cleanup (no-op)');
    }
  };
};

/**
 * Get current JWT token
 */
export const getCurrentJWTToken = (): string | null => {
  return getAuthState().token;
};

/**
 * Get current user from JWT
 */
export const getCurrentJWTUser = (): SimpleUser | null => {
  return getAuthState().user;
};

/**
 * Check if current JWT session is valid
 */
export const isCurrentJWTSessionValid = (): boolean => {
  const storeState = getAuthState();
  return storeState.isAuthenticated && 
         storeState.user !== null && 
         storeState.token !== null &&
         isSessionValid() && 
         isTokenValid();
};
