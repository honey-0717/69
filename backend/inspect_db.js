const { adminSupabase } = require('./src/db');

async function inspectDb() {
  const s = await adminSupabase.from('services').select('*');
  console.log('SERVICES IN DB:', s.data?.length, 'ERROR:', s.error);
  if (s.data && s.data.length > 0) {
    console.log('SAMPLE SERVICE:', s.data[0]);
  }

  const p = await adminSupabase.from('profile').select('*');
  console.log('PROFILE IN DB:', p.data?.length, 'ERROR:', p.error);
  if (p.data && p.data.length > 0) {
    console.log('SAMPLE PROFILE:', p.data[0]);
  }
}

inspectDb();
