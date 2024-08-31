import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import Stripe from 'stripe';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

admin.initializeApp();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in the environment');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

export const createCheckoutSession = functions.https.onRequest(async (req: functions.https.Request, res: functions.Response): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Method Not Allowed' });
  }

  const { domainName, userJWT, providerName } = req.body;

  let userId;
  try {
    const decodedToken = await admin.auth().verifyIdToken(userJWT);
    userId = decodedToken.uid;
  } catch (error) {
    res.status(401).send({ error: 'Invalid or expired token' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: domainName,
            },
            unit_amount: 1000, // amount in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
      client_reference_id: userId,
      metadata: {
        domainName,
        providerName,
      },
    });

    res.status(200).send({ sessionId: session.id });
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    res.status(400).send({ error: error instanceof Error ? error.message: 'An unknown error occurred' });
  }
});

interface RequestWithRawBody extends functions.https.Request {
  rawBody: any;
}

  export const stripeWebhook = functions.https.onRequest(async (req: RequestWithRawBody, res: functions.Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set in the environment');
    }
    
    let event: Stripe.Event | null = null;
  
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret
      );
    } catch (err: unknown) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  
    if (event && event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Handle successful payment
      console.log('Payment successful for session:', session.id);
      // Implement domain registration logic here
    }
  
    res.json({received: true});
  });