const { adminSupabase } = require('./src/db');

async function testMutations() {
  console.log('--- TESTING PROFILE UPDATE DIRECTLY AGAINST SUPABASE ---');
  const profRes = await adminSupabase.from('profile').update({
    bio: 'Direct Supabase Bio Test ' + Date.now(),
    updated_at: new Date().toISOString()
  }).eq('id', '00000000-0000-0000-0000-000000000001').select('*');
  console.log('PROFILE UPDATE RESULT:', JSON.stringify(profRes));

  console.log('\n--- TESTING SERVICE INSERT DIRECTLY AGAINST SUPABASE ---');
  const servRes = await adminSupabase.from('services').insert({
    name: 'Direct DB Test Service ' + Date.now(),
    price: 999,
    duration: '10 Minutes',
    category_id: '88bef4b9-fd4b-4ad2-97fa-4f9d154721c2',
    enabled: true,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).select('*');
  console.log('SERVICE INSERT RESULT:', JSON.stringify(servRes));
}

testMutations();
