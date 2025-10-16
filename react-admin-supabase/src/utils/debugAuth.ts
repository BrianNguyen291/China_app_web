import { supabase } from '../supabaseClient';

/**
 * Debug function để kiểm tra auth và role
 */
export const debugAuth = async () => {
  console.log('🔍 [DEBUG] Starting auth debug...');
  
  try {
    // 1. Kiểm tra auth session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 [DEBUG] Auth session:', {
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      authError: authError?.message
    });

    if (!user) {
      console.error('❌ [DEBUG] No authenticated user');
      return;
    }

    // 2. Kiểm tra user trong database với ID
    const { data: userById, error: errorById } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    console.log('🔍 [DEBUG] User by ID:', {
      userId: user.id,
      userData: userById,
      error: errorById?.message
    });

    // 3. Kiểm tra user trong database với email
    const { data: userByEmail, error: errorByEmail } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    console.log('🔍 [DEBUG] User by email:', {
      email: user.email,
      userData: userByEmail,
      error: errorByEmail?.message
    });

    // 4. Kiểm tra tất cả users
    const { data: allUsers, error: errorAll } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .order('created_at', { ascending: false });

    console.log('👥 [DEBUG] All users:', {
      users: allUsers,
      error: errorAll?.message
    });

    // 5. So sánh IDs
    const expectedAdminId = '6d961f4a-1898-431c-8667-43f840671b84';
    const isExpectedAdmin = user.id === expectedAdminId;
    
    console.log('🆔 [DEBUG] ID comparison:', {
      currentUserId: user.id,
      expectedAdminId: expectedAdminId,
      isExpectedAdmin: isExpectedAdmin,
      emailsMatch: userByEmail?.email === user.email
    });

    // 6. Kết luận
    console.log('📋 [DEBUG] Summary:', {
      isAuthenticated: !!user,
      hasUserInDB: !!userById,
      hasUserByEmail: !!userByEmail,
      isAdmin: userById?.role === 'admin',
      isActive: userById?.is_active,
      finalRole: userById?.role || 'unknown'
    });

  } catch (error: any) {
    console.error('❌ [DEBUG] Unexpected error:', error);
  }
};

/**
 * Function để test role checking với user cụ thể
 */
export const testRoleCheck = async (testUserId?: string) => {
  console.log('🧪 [TEST] Testing role check...');
  
  try {
    const userId = testUserId || '6d961f4a-1898-431c-8667-43f840671b84';
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', userId)
      .maybeSingle();

    console.log('🧪 [TEST] Role check result:', {
      userId,
      userData,
      error: error?.message,
      isAdmin: userData?.role === 'admin'
    });

    return userData;
  } catch (error: any) {
    console.error('❌ [TEST] Error:', error);
    return null;
  }
};

