-- Fix security issue: Restrict newsletter subscriptions access to admins only

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Anyone can view newsletter subscriptions" ON public.inscricoes_newsletter;

-- Create a new policy that only allows authenticated admin users to view newsletter subscriptions
CREATE POLICY "Only admins can view newsletter subscriptions" 
ON public.inscricoes_newsletter 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE nome = (
      SELECT email FROM auth.users 
      WHERE id = auth.uid()
    )
  )
);

-- Keep the existing INSERT policy unchanged so users can still subscribe
-- INSERT policy: "Anyone can insert newsletter subscriptions" remains the same