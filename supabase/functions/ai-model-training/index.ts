
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

    const { modelId, modelConfig, trainingData } = await req.json()

    console.log('Starting ML model training:', { modelId, modelType: modelConfig.type })

    // Update model status to training
    await supabaseClient
      .from('ml_models')
      .update({ 
        deployment_status: 'training',
        last_training_date: new Date().toISOString()
      })
      .eq('id', modelId)

    // Simulate training process
    const trainingSteps = 100
    const performanceMetrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1_score: 0,
      loss: 1.0,
      validation_loss: 1.0
    }

    // Simulate training iterations
    for (let step = 1; step <= trainingSteps; step++) {
      // Simulate training progress
      const progress = step / trainingSteps
      
      // Simulate improving metrics
      performanceMetrics.accuracy = 0.5 + (progress * 0.35) + (Math.random() * 0.1)
      performanceMetrics.precision = 0.45 + (progress * 0.4) + (Math.random() * 0.1)
      performanceMetrics.recall = 0.5 + (progress * 0.35) + (Math.random() * 0.1)
      performanceMetrics.f1_score = 2 * (performanceMetrics.precision * performanceMetrics.recall) / 
                                   (performanceMetrics.precision + performanceMetrics.recall)
      performanceMetrics.loss = 1.0 - (progress * 0.8) + (Math.random() * 0.1)
      performanceMetrics.validation_loss = 1.0 - (progress * 0.75) + (Math.random() * 0.15)

      // Log progress every 10 steps
      if (step % 10 === 0) {
        console.log(`Training step ${step}/${trainingSteps}:`, performanceMetrics)
        
        // Update model with current metrics
        await supabaseClient
          .from('ml_models')
          .update({ 
            performance_metrics: {
              ...performanceMetrics,
              training_step: step,
              training_progress: progress
            }
          })
          .eq('id', modelId)
      }

      // Simulate training time
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // Final model evaluation
    const finalMetrics = {
      accuracy: Math.round(performanceMetrics.accuracy * 10000) / 10000,
      precision: Math.round(performanceMetrics.precision * 10000) / 10000,
      recall: Math.round(performanceMetrics.recall * 10000) / 10000,
      f1_score: Math.round(performanceMetrics.f1_score * 10000) / 10000,
      final_loss: Math.round(performanceMetrics.loss * 10000) / 10000,
      validation_loss: Math.round(performanceMetrics.validation_loss * 10000) / 10000,
      training_completed: true,
      training_duration_seconds: trainingSteps * 0.05
    }

    // Determine if training was successful
    const isSuccessful = finalMetrics.accuracy > 0.75 && finalMetrics.f1_score > 0.7
    const deploymentStatus = isSuccessful ? 'trained' : 'failed'

    // Update model with final results
    await supabaseClient
      .from('ml_models')
      .update({
        deployment_status: deploymentStatus,
        performance_metrics: finalMetrics,
        accuracy_score: finalMetrics.accuracy,
        precision_score: finalMetrics.precision,
        recall_score: finalMetrics.recall,
        f1_score: finalMetrics.f1_score
      })
      .eq('id', modelId)

    // Create audit record for training completion
    const { data: model } = await supabaseClient
      .from('ml_models')
      .select('institutional_account_id, created_by')
      .eq('id', modelId)
      .single()

    if (model) {
      await supabaseClient
        .from('audit_records')
        .insert({
          institutional_account_id: model.institutional_account_id,
          user_id: model.created_by,
          activity_type: 'ml_training',
          resource_type: 'ml_model',
          resource_id: modelId,
          action: isSuccessful ? 'training_completed' : 'training_failed',
          new_values: {
            modelId,
            finalMetrics,
            deploymentStatus
          },
          risk_level: 'low'
        })
    }

    console.log('ML model training completed:', { modelId, deploymentStatus, finalMetrics })

    return new Response(
      JSON.stringify({
        modelId,
        status: deploymentStatus,
        metrics: finalMetrics,
        message: isSuccessful ? 'Model training completed successfully' : 'Model training failed to meet performance criteria'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ML training error:', error)

    // Update model status to failed
    if (req.body) {
      try {
        const { modelId } = await req.json()
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        )
        
        await supabaseClient
          .from('ml_models')
          .update({ deployment_status: 'failed' })
          .eq('id', modelId)
      } catch (updateError) {
        console.error('Failed to update model status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: 'ML model training failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
