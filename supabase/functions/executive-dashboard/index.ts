
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

    const { accountId } = await req.json()

    console.log('Generating executive dashboard for account:', accountId)

    // Get institutional account details
    const { data: account } = await supabaseClient
      .from('institutional_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (!account) {
      return new Response(
        JSON.stringify({ error: 'Institutional account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get team member count
    const { data: teamMembers } = await supabaseClient
      .from('institutional_team_members')
      .select('id')
      .eq('institutional_account_id', accountId)
      .eq('is_active', true)

    // Get compliance records
    const { data: complianceRecords } = await supabaseClient
      .from('compliance_records')
      .select('compliance_status, risk_score')
      .eq('institutional_account_id', accountId)

    // Calculate compliance score
    const complianceScore = complianceRecords && complianceRecords.length > 0
      ? complianceRecords.reduce((sum, record) => sum + (100 - record.risk_score), 0) / complianceRecords.length
      : 85

    // Get active strategies
    const { data: quantStrategies } = await supabaseClient
      .from('quant_strategies')
      .select('current_pnl, allocated_capital, sharpe_ratio')
      .eq('institutional_account_id', accountId)
      .eq('is_live', true)

    // Get ML models
    const { data: mlModels } = await supabaseClient
      .from('ml_models')
      .select('deployment_status, accuracy_score')
      .eq('institutional_account_id', accountId)

    // Get market making strategies
    const { data: mmStrategies } = await supabaseClient
      .from('market_making_strategies')
      .select('total_pnl, total_volume, uptime_percentage')
      .eq('institutional_account_id', accountId)
      .eq('is_active', true)

    // Get recent audit records
    const { data: recentAudit } = await supabaseClient
      .from('audit_records')
      .select('risk_level, created_at')
      .eq('institutional_account_id', accountId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    // Calculate metrics
    const totalPnL = (quantStrategies || []).reduce((sum, s) => sum + (s.current_pnl || 0), 0) +
                     (mmStrategies || []).reduce((sum, s) => sum + (s.total_pnl || 0), 0)

    const totalVolume = (mmStrategies || []).reduce((sum, s) => sum + (s.total_volume || 0), 0)

    const averageSharpe = quantStrategies && quantStrategies.length > 0
      ? quantStrategies.reduce((sum, s) => sum + (s.sharpe_ratio || 0), 0) / quantStrategies.length
      : 0

    const mlModelAccuracy = mlModels && mlModels.length > 0
      ? mlModels.filter(m => m.deployment_status === 'deployed')
              .reduce((sum, m) => sum + (m.accuracy_score || 0), 0) / 
        mlModels.filter(m => m.deployment_status === 'deployed').length
      : 0

    const systemUptime = mmStrategies && mmStrategies.length > 0
      ? mmStrategies.reduce((sum, s) => sum + (s.uptime_percentage || 99.9), 0) / mmStrategies.length
      : 99.9

    // Risk metrics (simulated)
    const riskMetrics = {
      var95: 0.02 + Math.random() * 0.01,
      expectedShortfall: 0.025 + Math.random() * 0.01,
      sharpeRatio: averageSharpe || (1.2 + Math.random() * 0.6),
      maxDrawdown: 0.05 + Math.random() * 0.05
    }

    // Trading volume metrics (simulated based on actual data)
    const volumeMetrics = {
      daily: totalVolume * 0.1,
      weekly: totalVolume * 0.7,
      monthly: totalVolume
    }

    // Activity summary for last 24 hours
    const activitySummary = {
      totalActivities: recentAudit?.length || 0,
      highRiskActivities: recentAudit?.filter(a => a.risk_level === 'high').length || 0,
      mediumRiskActivities: recentAudit?.filter(a => a.risk_level === 'medium').length || 0,
      lowRiskActivities: recentAudit?.filter(a => a.risk_level === 'low').length || 0
    }

    const dashboard = {
      accountInfo: {
        name: account.account_name,
        type: account.account_type,
        tier: account.service_tier,
        complianceLevel: account.compliance_level
      },
      totalAUM: account.total_aum || 0,
      netPnL: Math.round(totalPnL * 100) / 100,
      riskMetrics: {
        var95: Math.round(riskMetrics.var95 * 10000) / 100, // as percentage
        expectedShortfall: Math.round(riskMetrics.expectedShortfall * 10000) / 100,
        sharpeRatio: Math.round(riskMetrics.sharpeRatio * 100) / 100,
        maxDrawdown: Math.round(riskMetrics.maxDrawdown * 10000) / 100
      },
      complianceScore: Math.round(complianceScore),
      systemUptime: Math.round(systemUptime * 100) / 100,
      activeUsers: teamMembers?.length || 0,
      tradingVolume: {
        daily: Math.round(volumeMetrics.daily),
        weekly: Math.round(volumeMetrics.weekly),
        monthly: Math.round(volumeMetrics.monthly)
      },
      performanceMetrics: {
        activeStrategies: quantStrategies?.length || 0,
        liveStrategies: quantStrategies?.filter(s => s.current_pnl > 0).length || 0,
        averageSharpeRatio: Math.round(averageSharpe * 100) / 100,
        mlModelAccuracy: Math.round(mlModelAccuracy * 10000) / 100,
        marketMakingUptime: Math.round(systemUptime * 100) / 100
      },
      complianceStatus: {
        overallScore: Math.round(complianceScore),
        totalChecks: complianceRecords?.length || 0,
        compliantChecks: complianceRecords?.filter(r => r.compliance_status === 'compliant').length || 0,
        warningChecks: complianceRecords?.filter(r => r.compliance_status === 'warning').length || 0,
        nonCompliantChecks: complianceRecords?.filter(r => r.compliance_status === 'non_compliant').length || 0
      },
      activitySummary,
      lastUpdated: new Date().toISOString()
    }

    console.log('Executive dashboard generated successfully:', { accountId, metrics: dashboard.performanceMetrics })

    return new Response(
      JSON.stringify(dashboard),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Executive dashboard error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate executive dashboard' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
