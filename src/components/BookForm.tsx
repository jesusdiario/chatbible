
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface BookFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingBook: any;
}

export function BookForm({ formData, setFormData, onSubmit, editingBook }: BookFormProps) {
  const handleFileUpload = async (file: File, bookSlug: string) => {
    try {
      const fileName = `${bookSlug}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase
        .storage
        .from('covers')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('covers')
        .getPublicUrl(data.path);

      await supabase
        .from('bible_books')
        .update({ image_url: publicUrl })
        .eq('slug', bookSlug);

      toast({ title: "Sucesso", description: "Capa atualizada com sucesso!" });
    } catch (error: any) {
      toast({ 
        title: "Erro", 
        description: `Erro ao fazer upload da capa: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title">Título</label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="slug">Slug</label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="category">Categoria</label>
        <Select
          value={formData.book_category}
          onValueChange={(value) => setFormData({ ...formData, book_category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pentateuco">Pentateuco</SelectItem>
            <SelectItem value="historico">Histórico</SelectItem>
            <SelectItem value="poetico">Poético</SelectItem>
            <SelectItem value="profetico">Profético</SelectItem>
            <SelectItem value="novo_testamento">Novo Testamento</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="image">Capa do Livro</label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && formData.slug) {
              handleFileUpload(file, formData.slug);
            }
          }}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="display_order">Ordem de Exibição</label>
        <Input
          id="display_order"
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit">
          {editingBook ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogFooter>
    </form>
  );
}
