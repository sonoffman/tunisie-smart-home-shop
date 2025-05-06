
-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.create_training_request(p_full_name TEXT, p_email TEXT, p_phone TEXT, p_company TEXT, p_position TEXT, p_message TEXT);
DROP FUNCTION IF EXISTS public.get_training_requests();
DROP FUNCTION IF EXISTS public.update_training_request_status(p_id uuid, p_status text);

-- Drop table if it exists
DROP TABLE IF EXISTS public.training_requests;

-- Create training requests table
CREATE TABLE IF NOT EXISTS public.training_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  position TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create or replace function to add new training request
CREATE OR REPLACE FUNCTION public.create_training_request(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_company TEXT,
  p_position TEXT,
  p_message TEXT
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.training_requests (
    full_name, email, phone, company, position, message
  ) VALUES (
    p_full_name, p_email, p_phone, p_company, p_position, p_message
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Create function to get all training requests
CREATE OR REPLACE FUNCTION public.get_training_requests()
RETURNS SETOF public.training_requests
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.training_requests
  ORDER BY created_at DESC;
END;
$$;

-- Create function to update training request status
CREATE OR REPLACE FUNCTION public.update_training_request_status(
  p_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.training_requests
  SET status = p_status
  WHERE id = p_id;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.create_training_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_training_request TO anon;
GRANT EXECUTE ON FUNCTION public.get_training_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_training_request_status TO authenticated;

-- Grant access to the training_requests table
GRANT SELECT ON public.training_requests TO authenticated;
