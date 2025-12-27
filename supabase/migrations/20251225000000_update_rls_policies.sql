-- Migration to update RLS policies for admin access
-- This migration updates the existing policies to allow authenticated users to access bookings

-- Drop old restrictive policy if it exists
DROP POLICY IF EXISTS "Users cannot read bookings" ON public.bookings;

-- Allow authenticated users (admins) to read all bookings
CREATE POLICY IF NOT EXISTS "Authenticated users can read bookings"
ON public.bookings
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to update bookings
CREATE POLICY IF NOT EXISTS "Authenticated users can update bookings"
ON public.bookings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to delete bookings (optional, for future use)
CREATE POLICY IF NOT EXISTS "Authenticated users can delete bookings"
ON public.bookings
FOR DELETE
USING (auth.role() = 'authenticated');

