
-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anyone to create tickets (public support)
CREATE POLICY "Anyone can create support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

-- Only admins/staff can view and manage tickets
CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() 
      AND user_type IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can update tickets" ON public.support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() 
      AND user_type IN ('admin', 'staff')
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_tickets_updated_at 
  BEFORE UPDATE ON public.support_tickets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
