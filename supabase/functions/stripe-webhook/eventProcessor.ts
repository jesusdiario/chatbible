
import { logStep } from "./utils.ts";
import { 
  handleSuccessfulSubscription,
  handleSubscriptionUpdate,
  handleSubscriptionCancellation
} from "./subscriptionHandlers.ts";

// Process Stripe events based on type
export async function processStripeEvent(event: any, supabaseClient: any) {
  // Handle different event types
  switch (event.type) {
    case "checkout.session.completed":
      // Handle checkout completion
      const session = event.data.object;
      
      // Find the related customer
      if (session.customer && session.client_reference_id) {
        const userId = session.client_reference_id;
        
        // Update subscriptions table
        await handleSuccessfulSubscription(supabaseClient, userId, session);
        logStep("Processed checkout.session.completed event", { userId });
      } else {
        logStep("Missing customer or client_reference_id in checkout session", { 
          hasCustomer: !!session.customer, 
          hasClientRef: !!session.client_reference_id,
          sessionId: session.id 
        });
      }
      break;
      
    case "customer.subscription.updated":
      // Handle subscription updates
      const subscription = event.data.object;
      await handleSubscriptionUpdate(supabaseClient, subscription);
      logStep("Processed customer.subscription.updated event", { subId: subscription.id });
      break;
      
    case "customer.subscription.deleted":
      // Handle subscription cancellation
      const cancelledSubscription = event.data.object;
      await handleSubscriptionCancellation(supabaseClient, cancelledSubscription);
      logStep("Processed customer.subscription.deleted event", { subId: cancelledSubscription.id });
      break;
      
    default:
      logStep("Unhandled event type", { type: event.type });
      // Still return 200 for unhandled events to avoid Stripe retrying
  }
}
