// supabase.js

const SUPABASE_URL = "https://akuvonntuqdokwmwrmde.supabase.co";
const SUPABASE_KEY = "sb_publishable_zHE7DrwYiweHWyU-CxtsJQ_gMJv7m3Q";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);