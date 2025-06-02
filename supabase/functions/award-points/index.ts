
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { user_id, points, activity_type, description, chain_id, transaction_hash } = await req.json()

    // Update user points
    const { error: pointsError } = await supabaseClient
      .from('user_points')
      .upsert({
        user_id,
        total_points: points,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (pointsError) {
      console.error('Error updating points:', pointsError)
      return new Response(
        JSON.stringify({ error: 'Failed to update points' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Record activity
    const { error: activityError } = await supabaseClient
      .from('user_activities')
      .insert({
        user_id,
        activity_type,
        points_earned: points,
        description,
        chain_id,
        transaction_hash
      })

    if (activityError) {
      console.error('Error recording activity:', activityError)
      return new Response(
        JSON.stringify({ error: 'Failed to record activity' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
