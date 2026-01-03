-- Migration to add payment tracking fields to bookings table

-- Add payment-related columns
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS room_rate DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_payment DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_payment DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- Create function to calculate payment fields
CREATE OR REPLACE FUNCTION calculate_payment_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total_paid
  NEW.total_paid := COALESCE(NEW.initial_payment, 0) + COALESCE(NEW.final_payment, 0);
  
  -- Calculate balance_due
  NEW.balance_due := GREATEST(0, COALESCE(NEW.total_amount, 0) - NEW.total_paid);
  
  -- Determine payment_status
  IF NEW.total_paid = 0 THEN
    NEW.payment_status := 'unpaid';
  ELSIF NEW.total_paid >= NEW.total_amount THEN
    NEW.payment_status := 'fully_paid';
  ELSE
    NEW.payment_status := 'partially_paid';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate payment fields
DROP TRIGGER IF EXISTS trigger_calculate_payment_fields ON public.bookings;
CREATE TRIGGER trigger_calculate_payment_fields
  BEFORE INSERT OR UPDATE OF initial_payment, final_payment, total_amount ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_payment_fields();

-- Update existing bookings to calculate payment fields
UPDATE public.bookings
SET 
  room_rate = CASE 
    WHEN room_type = 'standard-room-only' THEN 250.00
    WHEN room_type = 'standard-with-breakfast' THEN 280.00
    ELSE 250.00
  END,
  total_amount = (
    CASE 
      WHEN room_type = 'standard-room-only' THEN 250.00
      WHEN room_type = 'standard-with-breakfast' THEN 280.00
      ELSE 250.00
    END
  ) * (EXTRACT(EPOCH FROM (check_out_date::timestamp - check_in_date::timestamp)) / 86400)::integer,
  total_paid = 0,
  balance_due = (
    CASE 
      WHEN room_type = 'standard-room-only' THEN 250.00
      WHEN room_type = 'standard-with-breakfast' THEN 280.00
      ELSE 250.00
    END
  ) * (EXTRACT(EPOCH FROM (check_out_date::timestamp - check_in_date::timestamp)) / 86400)::integer,
  payment_status = 'unpaid'
WHERE room_rate IS NULL OR room_rate = 0;

