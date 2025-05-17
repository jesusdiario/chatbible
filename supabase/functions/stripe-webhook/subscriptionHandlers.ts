
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";
import { logStep } from "./utils.ts";

// Handle successful subscription
export async function handleSuccessfulSubscription(
  supabaseClient: any,
  userId: string,
  session: any
) {
  // Get customer ID from session
  const customerId = session.customer;
  const stripeEmail = session.customer_details?.email;
  
  try {
    logStep("Handling subscription success", { userId, customerId, email: stripeEmail });
    
    // Se o userId for "anonymous", precisamos criar um novo usuário ou associar a um existente
    if (userId === "anonymous" && stripeEmail) {
      // Verifica se já existe um usuário com esse email
      const { data: existingUsers, error: userSearchError } = await supabaseClient
        .from('auth.users')
        .select('id')
        .eq('email', stripeEmail)
        .maybeSingle();
        
      if (userSearchError) {
        logStep("Error searching for user by email", { error: userSearchError.message });
      }
      
      // Se o usuário não existe, vamos criar um novo
      if (!existingUsers) {
        // Gerar uma senha aleatória
        const randomPassword = Math.random().toString(36).slice(-10);
        
        // Criar um novo usuário
        const { data: newUser, error: signUpError } = await supabaseClient.auth
          .admin
          .createUser({
            email: stripeEmail,
            password: randomPassword,
            email_confirm: true,
          });
        
        if (signUpError) {
          logStep("Error creating new user", { error: signUpError.message });
          throw signUpError;
        } else {
          // Atualizar o userId para o recém-criado
          userId = newUser.id;
          logStep("Created new user for subscriber", { newUserId: userId });
          
          // Enviar email com instruções para redefinir a senha
          await supabaseClient.auth
            .admin
            .generateLink({
              type: 'recovery',
              email: stripeEmail
            });
          
          logStep("Sent password reset email to new user", { email: stripeEmail });
        }
      } else {
        userId = existingUsers.id;
        logStep("Found existing user", { userId });
      }
    }
    
    // Obter os detalhes da assinatura
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2022-11-15",
    });
    
    // Obter a assinatura associada ao checkout
    const subscriptionId = session.subscription;
    let subscriptionData = null;
    let subscriptionEndDate = null;
    let subscriptionTier = "Premium"; // Default
    
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Determinar o tipo de assinatura (mensal ou anual) com base no plano
      const interval = subscription.items.data[0].plan.interval;
      subscriptionTier = interval === 'year' ? 'Premium Anual' : 'Premium Mensal';
      
      logStep("Retrieved subscription details", { 
        tier: subscriptionTier, 
        endDate: subscriptionEndDate,
        interval
      });
    }
    
    // Upsert subscriber data
    const { data: updatedData, error: upsertError } = await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: userId,
        email: stripeEmail,
        stripe_customer_id: customerId,
        subscribed: true,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEndDate,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    
    if (upsertError) {
      logStep("Error upserting subscriber", { error: upsertError.message });
      throw upsertError;
    }
    
    logStep("Successfully upserted subscriber", { userId, email: stripeEmail });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling successful subscription", { error: errorMessage });
    throw error;
  }
}

// Handle subscription updates
export async function handleSubscriptionUpdate(supabaseClient: any, subscription: any) {
  const customerId = subscription.customer;
  const status = subscription.status;
  const isActive = status === "active" || status === "trialing";
  const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
  
  try {
    logStep("Handling subscription update", { 
      customerId, 
      status, 
      isActive, 
      subscriptionEnd: subscriptionEndDate 
    });
    
    // Get the price ID to determine subscription tier
    const priceId = subscription.items.data[0].price.id;
    
    // Get the interval (monthly or yearly)
    const interval = subscription.items.data[0].plan.interval;
    const subscriptionTier = interval === 'year' ? 'Premium Anual' : 'Premium Mensal';
    logStep("Determined subscription tier based on interval", { interval, tier: subscriptionTier });
    
    // Find subscriber by Stripe customer ID
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("subscribers")
      .select("user_id")
      .eq("stripe_customer_id", customerId);
    
    if (subscribersError) {
      logStep("Error finding subscribers", { error: subscribersError.message });
      throw subscribersError;
    }
    
    if (!subscribers || subscribers.length === 0) {
      logStep("No subscriber found for customer", { customerId });
      return;
    }
    
    logStep("Found subscribers for customer", { 
      count: subscribers.length, 
      subscribers: subscribers.map(s => s.user_id) 
    });
    
    // Update subscriber record
    for (const subscriber of subscribers) {
      const { error: updateError } = await supabaseClient
        .from("subscribers")
        .update({
          subscribed: isActive,
          subscription_tier: subscriptionTier,
          subscription_end: subscriptionEndDate,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", subscriber.user_id);
      
      if (updateError) {
        logStep("Error updating subscriber", { 
          error: updateError.message, 
          userId: subscriber.user_id 
        });
      } else {
        logStep("Successfully updated subscriber", { 
          userId: subscriber.user_id, 
          tier: subscriptionTier
        });
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling subscription update", { error: errorMessage });
    throw error;
  }
}

// Handle subscription cancellation
export async function handleSubscriptionCancellation(supabaseClient: any, subscription: any) {
  const customerId = subscription.customer;
  
  try {
    logStep("Handling subscription cancellation", { customerId });
    
    // Find subscribers with this customer ID
    const { data: subscribers, error: findError } = await supabaseClient
      .from("subscribers")
      .select("user_id")
      .eq("stripe_customer_id", customerId);
    
    if (findError) {
      logStep("Error finding subscribers to cancel", { error: findError.message });
      throw findError;
    }
    
    if (!subscribers || subscribers.length === 0) {
      logStep("No subscribers found for cancellation", { customerId });
      return;
    }
    
    // Update all subscribers for this customer
    for (const subscriber of subscribers) {
      const { error: updateError } = await supabaseClient
        .from("subscribers")
        .update({
          subscribed: false,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", subscriber.user_id);
      
      if (updateError) {
        logStep("Error cancelling subscription", { 
          error: updateError.message, 
          userId: subscriber.user_id 
        });
      } else {
        logStep("Successfully cancelled subscription", { userId: subscriber.user_id });
      }
    }
      
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling subscription cancellation", { error: errorMessage });
    throw error;
  }
}
