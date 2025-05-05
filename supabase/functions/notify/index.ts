import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Twilio } from 'npm:twilio@4.22.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, to, type = 'incident' } = await req.json();

    if (!message || !to) {
      return new Response(
        JSON.stringify({ error: 'Message and recipient are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const client = new Twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    );

    // Format message based on type
    const formattedMessage = type === 'incident' 
      ? `🚨 New Incident Report\n\n${message}`
      : message;

    await client.messages.create({
      body: formattedMessage,
      from: `whatsapp:${Deno.env.get('TWILIO_WHATSAPP_NUMBER')}`,
      to: `whatsapp:${to}`
    });

    return new Response(
      JSON.stringify({ success: true }),
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