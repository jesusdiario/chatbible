
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types/category";
import { CategoryFormDialog } from "@/components/admin/categories/CategoryFormDialog";
import { DeleteCategoryDialog } from "@/components/admin/categories/DeleteCategoryDialog";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";

const AdminCategories = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    title: '',
    display_order: 0,
    page_slug: 'livros-da-biblia'
  });

  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();

  const handleAddCategory = () => {
    if (!formData.title) return;
    createCategory(formData as Omit<Category, 'id' | 'created_at' | 'updated_at'>);
    setIsAddDialogOpen(false);
    setFormData({
      title: '',
      display_order: 0,
      page_slug: 'livros-da-biblia'
    });
  };

  const handleUpdateCategory = () => {
    if (!currentCategory?.title) return;
    updateCategory(currentCategory);
    setIsEditDialogOpen(false);
    setCurrentCategory(null);
  };

  const handleDeleteCategory = () => {
    if (currentCategory) {
      deleteCategory(currentCategory.id);
      setIsDeleteDialogOpen(false);
      setCurrentCategory(null);
    }
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-white min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>

            <Card className="bg-chatgpt-sidebar border-none text-white">
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Carregando categorias...</div>
                ) : !categories || categories.length === 0 ? (
                  <div className="text-center py-4">
                    Nenhuma categoria encontrada. Clique em "Nova Categoria" para criar uma.
                  </div>
                ) : (
                  <CategoriesTable 
                    categories={categories}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CategoryFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddCategory}
        title="Adicionar Nova Categoria"
        description="Crie uma nova categoria para organizar os conteúdos."
        category={formData}
        setCategory={setFormData}
      />

      <CategoryFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateCategory}
        title="Editar Categoria"
        description="Atualize os detalhes da categoria."
        category={currentCategory || {}}
        setCategory={setCurrentCategory}
      />

      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCategory}
        category={currentCategory}
      />
    </div>
  );
};

export default AdminCategories;
