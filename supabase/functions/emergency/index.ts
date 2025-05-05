import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface EmergencyAlert {
  site_id: string;
  type: 'danger' | 'contact';
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const siteId = url.searchParams.get('site_id');
    const type = url.searchParams.get('type') as 'danger' | 'contact';
    const latitude = url.searchParams.get('lat');
    const longitude = url.searchParams.get('lng');

    if (!siteId || !type) {
      return new Response(
        JSON.stringify({ error: 'Site ID and type are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create emergency alert
    const alert: EmergencyAlert = {
      site_id: siteId,
      type,
      timestamp: new Date().toISOString(),
    };

    if (latitude && longitude) {
      alert.latitude = parseFloat(latitude);
      alert.longitude = parseFloat(longitude);
    }

    const { error: alertError } = await supabase
      .from('emergency_alerts')
      .insert([alert]);

    if (alertError) throw alertError;

    return new Response(
      JSON.stringify({ message: 'Emergency alert created successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});