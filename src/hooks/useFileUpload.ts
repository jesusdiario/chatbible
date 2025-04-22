
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export function useFileUpload() {
  const uploadMutation = useMutation({
    mutationFn: async ({ file, bookSlug }: { file: File; bookSlug: string }) => {
      try {
        const fileName = `${bookSlug}-${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase
          .storage
          .from('covers')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase
          .storage
          .from('covers')
          .getPublicUrl(data.path);

        return publicUrl;
      } catch (error: any) {
        throw new Error(`Error uploading file: ${error.message}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return uploadMutation;
}
