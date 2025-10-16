import { supabase } from '../supabaseClient';

interface DebugResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  isExpectedAdmin?: boolean;
  isAdmin?: boolean;
  error?: string;
}

/**
 * Debug function để kiểm tra chi tiết login và permission
 */
export const debugLoginIssue = async (): Promise<DebugResult> => {
  console.log('🔍 [DEBUG_LOGIN] Starting comprehensive debug...');
  
  try {
    // 1. Kiểm tra auth session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 [DEBUG_LOGIN] Auth session:', {
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      } : null,
      authError: authError?.message
    });

    if (!user) {
      console.error('❌ [DEBUG_LOGIN] No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    // 2. Kiểm tra user trong database với ID
    const { data: userById, error: errorById } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('🔍 [DEBUG_LOGIN] User by ID:', {
      queryId: user.id,
      userData: userById,
      error: errorById?.message
    });

    // 3. Kiểm tra user trong database với email
    const { data: userByEmail, error: errorByEmail } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    console.log('🔍 [DEBUG_LOGIN] User by email:', {
      queryEmail: user.email,
      userData: userByEmail,
      error: errorByEmail?.message
    });

    // 4. So sánh với expected admin
    const expectedAdminId = '6d961f4a-1898-431c-8667-43f840671b84';
    const expectedAdminEmail = 'minhquyen@gmail.com';
    
    const isExpectedUser = user.id === expectedAdminId && user.email === expectedAdminEmail;
    
    console.log('🆔 [DEBUG_LOGIN] User comparison:', {
      currentUserId: user.id,
      expectedAdminId: expectedAdminId,
      currentUserEmail: user.email,
      expectedAdminEmail: expectedAdminEmail,
      isExpectedUser: isExpectedUser,
      idMatch: user.id === expectedAdminId,
      emailMatch: user.email === expectedAdminEmail
    });

    // 5. Kiểm tra permission logic
    const isAdmin = userById?.role === 'admin' && userById?.is_active === true;
    
    console.log('📋 [DEBUG_LOGIN] Permission analysis:', {
      role: userById?.role,
      isActive: userById?.is_active,
      isAdmin: isAdmin,
      permissionLogic: {
        roleCheck: userById?.role === 'admin',
        activeCheck: userById?.is_active === true,
        combinedCheck: userById?.role === 'admin' && userById?.is_active === true
      }
    });

    // 6. Kết luận
    const result = {
      success: isAdmin,
      user: {
        id: user.id,
        email: user.email,
        role: userById?.role,
        isActive: userById?.is_active
      },
      isExpectedAdmin: isExpectedUser,
      isAdmin: isAdmin,
      error: !userById ? 'User not found in database' : 
             userById.role !== 'admin' ? 'User is not admin' :
             !userById.is_active ? 'User is inactive' : null
    };

    console.log('📊 [DEBUG_LOGIN] Final result:', result);
    
    return result;

  } catch (error: any) {
    console.error('❌ [DEBUG_LOGIN] Unexpected error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Function để force update user thành admin
 */
export const forceUpdateToAdmin = async (email: string) => {
  console.log('🔧 [FORCE_UPDATE] Force updating user to admin:', email);
  
  try {
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        is_active: true 
      })
      .eq('email', email)
      .select('id, email, role, is_active');

    if (updateError) {
      console.error('❌ [FORCE_UPDATE] Update error:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('✅ [FORCE_UPDATE] Update result:', updateResult);
    
    return { success: true, data: updateResult };

  } catch (error: any) {
    console.error('❌ [FORCE_UPDATE] Unexpected error:', error);
    return { success: false, error: error.message };
  }
};
