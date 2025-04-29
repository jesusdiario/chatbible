
-- Esta função não é mais necessária já que estamos usando uma abordagem direta de update.
-- Mantida aqui apenas como referência para casos futuros
CREATE OR REPLACE FUNCTION public.increment_message_count(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.message_counts (user_id, count, last_reset_time)
  VALUES (user_id_param, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    count = message_counts.count + 1,
    updated_at = NOW();
END;
$$;
