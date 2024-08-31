import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';

console.log('checkout render')

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const functions = getFunctions();

const Checkout: React.FC = () => {
  if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
    console.error('Stripe publishable key is missing');
    return <div>Error: Stripe key is not configured</div>;
  }

  const handleCheckout = async () => {
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({
        // Add parameters your Cloud Function expects
      });
      
      const { sessionId } = result.data as { sessionId: string };
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return <button onClick={handleCheckout}>Checkout</button>;
};

export default Checkout;