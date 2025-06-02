
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

    const { user_id } = await req.json()

    // Generate unique referral code
    let code: string
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
      // Generate code format: STEX-XXXXXX
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
      code = `STEX-${randomPart}`

      // Check if code already exists
      const { data: existingCode } = await supabaseClient
        .from('referrals')
        .select('referral_code')
        .eq('referral_code', code)
        .single()

      if (!existingCode) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate unique referral code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ referral_code: code! }),
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
