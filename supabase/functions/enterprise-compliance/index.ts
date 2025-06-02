
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

    const { tradeData, accountId } = await req.json()

    console.log('Processing compliance check:', { tradeData, accountId })

    // Get institutional account compliance settings
    const { data: account } = await supabaseClient
      .from('institutional_accounts')
      .select('compliance_level, risk_profile, jurisdiction')
      .eq('id', accountId)
      .single()

    if (!account) {
      return new Response(
        JSON.stringify({ error: 'Institutional account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Perform compliance checks
    const violations = []
    let riskScore = 0

    // 1. Position Size Limits
    const positionValue = tradeData.quantity * tradeData.price
    const maxPositionSize = account.risk_profile?.max_position_size || 1000000

    if (positionValue > maxPositionSize) {
      violations.push({
        type: 'position_limit_exceeded',
        severity: 'high',
        details: `Position size ${positionValue} exceeds limit ${maxPositionSize}`,
        required_action: 'Reduce position size'
      })
      riskScore += 25
    }

    // 2. Concentration Risk
    if (positionValue > maxPositionSize * 0.1) {
      violations.push({
        type: 'concentration_risk',
        severity: 'medium',
        details: 'Position creates concentration risk',
        required_action: 'Review portfolio diversification'
      })
      riskScore += 10
    }

    // 3. Jurisdiction-specific checks
    if (account.jurisdiction === 'US') {
      // US-specific compliance checks
      if (tradeData.quantity > 50000) {
        violations.push({
          type: 'large_trader_reporting',
          severity: 'medium',
          details: 'Trade requires large trader reporting',
          required_action: 'File required regulatory reports'
        })
        riskScore += 5
      }
    }

    // 4. AML Screening (simplified)
    if (positionValue > 10000) {
      // Simulate AML check
      const amlRisk = Math.random()
      if (amlRisk > 0.95) {
        violations.push({
          type: 'aml_flag',
          severity: 'critical',
          details: 'Trade flagged for AML review',
          required_action: 'Manual AML review required'
        })
        riskScore += 50
      }
    }

    // Create audit record
    await supabaseClient
      .from('audit_records')
      .insert({
        institutional_account_id: accountId,
        activity_type: 'compliance_check',
        resource_type: 'trade',
        resource_id: tradeData.id || 'pending',
        action: 'compliance_check',
        new_values: {
          tradeData,
          complianceResult: {
            isCompliant: violations.length === 0,
            riskScore,
            violationCount: violations.length
          }
        },
        risk_level: riskScore > 30 ? 'high' : riskScore > 15 ? 'medium' : 'low',
        compliance_flags: violations.map(v => v.type)
      })

    const result = {
      isCompliant: violations.length === 0,
      violations,
      riskScore,
      requiredActions: violations.map(v => ({
        action: v.required_action,
        priority: v.severity,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })),
      complianceLevel: account.compliance_level,
      jurisdiction: account.jurisdiction
    }

    console.log('Compliance check completed:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Compliance check error:', error)
    return new Response(
      JSON.stringify({ error: 'Compliance check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
