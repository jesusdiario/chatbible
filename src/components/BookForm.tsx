
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
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "@/hooks/use-toast";
import { useBibleCategories } from "@/hooks/useBibleCategories";

interface BookFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingBook: any;
}

export function BookForm({ formData, setFormData, onSubmit, editingBook }: BookFormProps) {
  const uploadMutation = useFileUpload();
  const { data: categories, isLoading: categoriesLoading } = useBibleCategories();

  const handleFileUpload = async (file: File) => {
    if (!formData.slug) {
      toast({ 
        title: "Erro", 
        description: "Por favor, preencha o slug antes de fazer upload da capa",
        variant: "destructive"
      });
      return;
    }

    const publicUrl = await uploadMutation.mutateAsync({
      file,
      bookSlug: formData.slug
    });

    setFormData({ ...formData, image_url: publicUrl });
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
          disabled={categoriesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categoriesLoading && <p className="text-xs text-muted-foreground">Carregando categorias...</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="image">Capa do Livro</label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
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
