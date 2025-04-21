
import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { BookFormData, BookCategory } from '@/types/book';

interface BookFormProps {
  formData: BookFormData;
  setFormData: (data: BookFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const BookForm = ({ formData, setFormData, onSubmit }: BookFormProps) => {
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
          onValueChange={(value: BookCategory) => setFormData({ ...formData, book_category: value })}
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
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="image">URL da Imagem</label>
        <Input
          id="image"
          value={formData.image_url || ''}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button type="submit">
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
};

export default BookForm;
