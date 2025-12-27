-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  room_type TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings (public booking form)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Drop old restrictive policy if it exists (for existing installations)
DROP POLICY IF EXISTS "Users cannot read bookings" ON public.bookings;

-- Allow authenticated users (admins) to read all bookings
CREATE POLICY "Authenticated users can read bookings"
ON public.bookings
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to update bookings
CREATE POLICY "Authenticated users can update bookings"
ON public.bookings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to delete bookings (optional, for future use)
CREATE POLICY "Authenticated users can delete bookings"
ON public.bookings
FOR DELETE
USING (auth.role() = 'authenticated');
