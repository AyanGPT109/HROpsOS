import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: workers, error: workerErr } = await supabase.from('workers').select('id, user_id, plant_id, is_active');
  console.log('Workers:', workers);
  
  const { data: fences, error: fenceErr } = await supabase.from('geo_fence').select('*');
  console.log('Fences:', fences);
  
  const { data: plants, error: plantErr } = await supabase.from('plants').select('id, name');
  console.log('Plants:', plants);
}

run();
