
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export function useFileUpload() {
  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileNamePrefix, bucket = 'avatars' }: { file: File; fileNamePrefix: string; bucket?: string }) => {
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Formato não suportado. Use imagens nos formatos JPG, PNG ou WebP.');
        }
        
        // Validate file size (2MB max)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 2) {
          throw new Error('A imagem deve ter no máximo 2MB.');
        }
        
        // Make sure the file name is unique and includes the correct prefix for RLS
        const fileExt = file.name.split('.').pop();
        const fileName = `${fileNamePrefix}-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase
          .storage
          .from(bucket)
          .getPublicUrl(data.path);

        return publicUrl;
      } catch (error: any) {
        throw new Error(`Erro ao enviar arquivo: ${error.message}`);
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
