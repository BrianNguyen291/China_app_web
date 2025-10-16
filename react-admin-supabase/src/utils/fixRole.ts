import { supabase } from '../supabaseClient';

/**
 * Function để fix role cho user hiện tại
 */
export const fixUserRole = async () => {
  console.log('🔧 [FIX] Starting role fix...');
  
  try {
    // 1. Lấy user hiện tại
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ [FIX] No authenticated user:', authError);
      return false;
    }

    console.log('👤 [FIX] Current user:', {
      id: user.id,
      email: user.email
    });

    // 2. Force update role thành admin
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        is_active: true 
      })
      .eq('id', user.id)
      .select('id, email, role, is_active');

    if (updateError) {
      console.error('❌ [FIX] Update error:', updateError);
      return false;
    }

    console.log('✅ [FIX] Role updated:', updateResult);

    // 3. Verify update
    const { data: verifyResult, error: verifyError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', user.id)
      .single();

    if (verifyError) {
      console.error('❌ [FIX] Verify error:', verifyError);
      return false;
    }

    console.log('✅ [FIX] Verification result:', verifyResult);
    
    return verifyResult.role === 'admin' && verifyResult.is_active === true;

  } catch (error: any) {
    console.error('❌ [FIX] Unexpected error:', error);
    return false;
  }
};

/**
 * Function để tạo user mới với role admin nếu chưa tồn tại
 */
export const ensureAdminUser = async (email: string) => {
  console.log('🔧 [ENSURE] Ensuring admin user for:', email);
  
  try {
    // 1. Kiểm tra user có tồn tại không
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('❌ [ENSURE] Check error:', checkError);
      return false;
    }

    if (existingUser) {
      console.log('👤 [ENSURE] User exists:', existingUser);
      
      // Update role nếu chưa phải admin
      if (existingUser.role !== 'admin') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'admin',
            is_active: true 
          })
          .eq('email', email);

        if (updateError) {
          console.error('❌ [ENSURE] Update error:', updateError);
          return false;
        }

        console.log('✅ [ENSURE] Role updated to admin');
      }
      
      return true;
    }

    // 2. Tạo user mới nếu chưa tồn tại
    console.log('➕ [ENSURE] Creating new admin user...');
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email,
        role: 'admin',
        is_active: true
      })
      .select('id, email, role, is_active')
      .single();

    if (createError) {
      console.error('❌ [ENSURE] Create error:', createError);
      return false;
    }

    console.log('✅ [ENSURE] New admin user created:', newUser);
    return true;

  } catch (error: any) {
    console.error('❌ [ENSURE] Unexpected error:', error);
    return false;
  }
};

