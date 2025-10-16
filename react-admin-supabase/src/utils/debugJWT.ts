import { getJWTPayload, verifyJWT } from './jwtAuth';

/**
 * Debug JWT token từ storage
 */
export const debugJWTToken = () => {
  console.log('🔍 [DEBUG_JWT] Debugging JWT token...');
  
  // Check localStorage
  const authStorage = localStorage.getItem('auth-storage');
  console.log('📦 [DEBUG_JWT] Raw auth-storage:', authStorage);
  
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log('📦 [DEBUG_JWT] Parsed auth-storage:', parsed);
      
      if (parsed.state) {
        const state = parsed.state;
        console.log('📦 [DEBUG_JWT] Auth state:', {
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          hasToken: !!state.token,
          userEmail: state.user?.email,
          userRole: state.user?.role
        });
        
        if (state.token) {
          console.log('🎫 [DEBUG_JWT] JWT Token:', state.token);
          
          // Decode payload without verification
          const payload = getJWTPayload(state.token);
          console.log('🎫 [DEBUG_JWT] JWT Payload:', payload);
          
          if (payload) {
            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < now;
            console.log('⏰ [DEBUG_JWT] Token expiration:', {
              exp: payload.exp,
              now: now,
              isExpired: isExpired,
              expiresIn: payload.exp - now
            });
          }
          
          // Verify token
          const verified = verifyJWT(state.token);
          console.log('✅ [DEBUG_JWT] Token verification:', verified ? 'VALID' : 'INVALID');
        }
      }
    } catch (error) {
      console.error('❌ [DEBUG_JWT] Error parsing auth-storage:', error);
    }
  } else {
    console.log('❌ [DEBUG_JWT] No auth-storage found in localStorage');
  }
  
  // Check Zustand store
  try {
    import('../store/authStore').then(({ useAuthStore }) => {
      const storeState = useAuthStore.getState();
      console.log('🏪 [DEBUG_JWT] Zustand store state:', {
        isAuthenticated: storeState.isAuthenticated,
        hasUser: !!storeState.user,
        hasToken: !!storeState.token,
        userEmail: storeState.user?.email,
        loading: storeState.loading,
        error: storeState.error
      });
    }).catch(error => {
      console.error('❌ [DEBUG_JWT] Error accessing Zustand store:', error);
    });
  } catch (error) {
    console.error('❌ [DEBUG_JWT] Error accessing Zustand store:', error);
  }
};

/**
 * Clear all JWT data
 */
export const clearAllJWTData = () => {
  console.log('🧹 [DEBUG_JWT] Clearing all JWT data...');
  
  // Clear localStorage
  localStorage.removeItem('auth-storage');
  
  // Clear Zustand store
  try {
    import('../store/authStore').then(({ useAuthStore }) => {
      useAuthStore.getState().logout();
      console.log('✅ [DEBUG_JWT] Cleared all JWT data');
    }).catch(error => {
      console.error('❌ [DEBUG_JWT] Error clearing Zustand store:', error);
    });
  } catch (error) {
    console.error('❌ [DEBUG_JWT] Error clearing Zustand store:', error);
  }
};

/**
 * Test JWT generation and verification
 */
export const testJWTGeneration = () => {
  console.log('🧪 [DEBUG_JWT] Testing JWT generation...');
  
  const testUser = {
    id: 'test-id',
    email: 'test@example.com',
    display_name: 'Test User',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
    level: 1
  };
  
  try {
    import('./jwtAuth').then(({ generateJWT, verifyJWT }) => {
      generateJWT(testUser).then(token => {
        console.log('🎫 [DEBUG_JWT] Generated token:', token);
        
        const verified = verifyJWT(token || '');
        console.log('✅ [DEBUG_JWT] Token verification result:', verified);
        
        return { token, verified };
      });
    }).catch(error => {
      console.error('❌ [DEBUG_JWT] Error testing JWT:', error);
      return { token: null, verified: false };
    });
  } catch (error) {
    console.error('❌ [DEBUG_JWT] Error testing JWT:', error);
    return { token: null, verified: false };
  }
};
