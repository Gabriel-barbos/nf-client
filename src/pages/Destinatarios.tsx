import { useState } from "react";
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDestinatarios } from "@/hooks/useDestinatarios"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DestinatarioDrawer from "@/components/destinatarios/DestinatarioDrawer";

export default function Destinatarios() {
  const { destinatarios, loading, error, deleteDestinatario } = useDestinatarios();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Filtro
  const filteredDestinatarios = destinatarios.filter(
    (dest) =>
      dest.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dest.cpf && dest.cpf.includes(searchTerm)) ||
      (dest.cnpj && dest.cnpj.includes(searchTerm))
  );

  // Paginação
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDestinatarios = filteredDestinatarios.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredDestinatarios.length / itemsPerPage);

  const getTipo = (dest: any) => {
    if (dest.cnpj && dest.cnpj.trim() !== "") return "CNPJ";
    if (dest.cpf && dest.cpf.trim() !== "") return "CPF";
    return "Padrão";
  };

  const handleEdit = (id: string) => {
    toast.info("Funcionalidade de edição em desenvolvimento");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDestinatario(id);
      toast.success("Destinatário excluído com sucesso!");
    } catch (err) {
      toast.error("Erro ao excluir destinatário.");
    }
  };

  const handleCreate = () => {
    setDrawerOpen(true);
  };


  if (loading) return <p className="text-center mt-10">Carregando destinatários...</p>;
  if (error) return <p className="text-center mt-10 text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Destinatários</h1>
          <p className="text-muted-foreground mt-2">
            Destinatários cadastrados:{" "}
            <span className="font-semibold text-foreground">{destinatarios.length}</span>
          </p>
        </div>

        <DestinatarioDrawer />
      </div>


      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDestinatarios.map((dest) => (
                  <TableRow key={dest._id}>
                    <TableCell>
                      <Badge variant={getTipo(dest) === "CPF" ? "default" : "secondary"}>
                        {getTipo(dest)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{dest.nome}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {dest.cpf || dest.cnpj}
                    </TableCell>
                    <TableCell>
                      {dest.endereco}, {dest.numero}
                      {dest.complemento && `, ${dest.complemento}`}
                    </TableCell>
                    <TableCell>{dest.telefone || dest.celular || "-"}</TableCell>
                    <TableCell>
                      {dest.cidade}/{dest.estado}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(dest._id!)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Destinatário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir <b>{dest.nome}</b>?
                                Esta ação não poderá ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive/90"
                                onClick={() => handleDelete(dest._id!)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Paginação */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
