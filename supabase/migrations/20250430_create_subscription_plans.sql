
-- Create subscription plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  message_limit INTEGER NOT NULL DEFAULT 10,
  price_amount INTEGER NOT NULL DEFAULT 0,
  price_currency TEXT NOT NULL DEFAULT 'BRL',
  features JSONB DEFAULT '[]'::jsonb,
  stripe_price_id TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for everyone to read subscription plans
CREATE POLICY IF NOT EXISTS "subscription_plans_select_policy"
ON public.subscription_plans
FOR SELECT
USING (true);

-- Create subscribers table if not exists
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY IF NOT EXISTS "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY IF NOT EXISTS "update_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY IF NOT EXISTS "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Insert or update the free plan
INSERT INTO public.subscription_plans (name, description, message_limit, price_amount, price_currency, features, stripe_price_id, is_active)
VALUES ('Gratuito', 'Acesso básico à plataforma', 10, 0, 'BRL', '["Acesso aos livros da Bíblia", "Conversas limitadas", "Histórico limitado"]', 'free_plan', true)
ON CONFLICT (stripe_price_id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  message_limit = EXCLUDED.message_limit,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Insert or update the premium plan
INSERT INTO public.subscription_plans (name, description, message_limit, price_amount, price_currency, features, stripe_price_id, is_active)
VALUES ('Premium', 'Acesso completo à plataforma', 1000, 1990, 'BRL', '["Acesso a todos os livros da Bíblia", "Conversas ilimitadas", "Histórico completo", "Exportação de conversas", "Suporte prioritário"]', 'price_1RJfFtLyyMwTutR95rlmrvcA', true)
ON CONFLICT (stripe_price_id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  message_limit = EXCLUDED.message_limit,
  price_amount = EXCLUDED.price_amount,
  price_currency = EXCLUDED.price_currency,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = now();
