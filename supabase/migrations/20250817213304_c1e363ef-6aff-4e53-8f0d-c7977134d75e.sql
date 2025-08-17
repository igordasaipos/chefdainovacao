-- Fix security issue: Restrict voting data access to admins only

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Anyone can view votos" ON public.votos;

-- Create a new policy that only allows authenticated admin users to view voting data
CREATE POLICY "Only admins can view votos" 
ON public.votos 
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

-- Keep the existing INSERT and DELETE policies unchanged so voting functionality works
-- INSERT policy: "Anyone can insert votos" remains the same
-- DELETE policy: "Anyone can delete votos" remains the same