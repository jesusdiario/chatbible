
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category } from "@/types/category";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  description: string;
  category: Partial<Category>;
  setCategory: (category: Partial<Category>) => void;
}

export const CategoryFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  category,
  setCategory,
}: CategoryFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-chatgpt-sidebar text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right">
              Título
            </label>
            <Input
              id="title"
              value={category.title || ''}
              onChange={(e) => setCategory({ ...category, title: e.target.value })}
              className="col-span-3 bg-chatgpt-main border-gray-700"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="order" className="text-right">
              Ordem
            </label>
            <Input
              id="order"
              type="number"
              value={category.display_order || 0}
              onChange={(e) => setCategory({ ...category, display_order: parseInt(e.target.value) })}
              className="col-span-3 bg-chatgpt-main border-gray-700"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="page" className="text-right">
              Página
            </label>
            <Input
              id="page"
              value={category.page_slug || ''}
              onChange={(e) => setCategory({ ...category, page_slug: e.target.value })}
              className="col-span-3 bg-chatgpt-main border-gray-700"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {title === "Adicionar Nova Categoria" ? "Adicionar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
