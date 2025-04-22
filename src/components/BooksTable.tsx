
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBibleCategories } from "@/hooks/useBibleCategories";

interface BooksTableProps {
  books: any[];
  onEdit: (book: any) => void;
  onDelete: (id: string) => void;
}

export function BooksTable({ books, onEdit, onDelete }: BooksTableProps) {
  const { data: categories } = useBibleCategories();
  
  // Função para obter o título da categoria com base no slug
  const getCategoryTitle = (categorySlug: string) => {
    const category = categories?.find(cat => cat.slug === categorySlug);
    return category?.title || categorySlug;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Ordem</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {books?.map((book) => (
          <TableRow key={book.id}>
            <TableCell>{book.title}</TableCell>
            <TableCell>{book.slug}</TableCell>
            <TableCell>{getCategoryTitle(book.book_category)}</TableCell>
            <TableCell>{book.display_order}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(book)}
                >
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(book.id)}
                >
                  Excluir
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
