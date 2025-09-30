import { useState } from "react";
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Destinatario } from "@/types";

// Dados mockados
const destinatariosMock: Destinatario[] = [
  {
    id: "dest-1",
    tipo: "PF",
    nome: "João Silva",
    cpf: "123.456.789-00",
    email: "joao@email.com",
    telefone: "(11) 98765-4321",
    endereco: {
      logradouro: "Rua das Flores",
      numero: "123",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567",
    },
    createdAt: "2024-01-10",
  },
  {
    id: "dest-2",
    tipo: "PJ",
    nome: "Empresa ABC Ltda",
    cnpj: "12.345.678/0001-90",
    email: "contato@empresaabc.com",
    telefone: "(11) 3456-7890",
    endereco: {
      logradouro: "Av. Paulista",
      numero: "1000",
      complemento: "Sala 200",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100",
    },
    createdAt: "2024-01-12",
  },
  {
    id: "dest-3",
    tipo: "PF",
    nome: "Maria Santos",
    cpf: "987.654.321-00",
    email: "maria@email.com",
    telefone: "(21) 99876-5432",
    endereco: {
      logradouro: "Rua do Comércio",
      numero: "456",
      bairro: "Centro",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cep: "20040-020",
    },
    createdAt: "2024-01-15",
  },
];

export default function Destinatarios() {
  const [destinatarios] = useState<Destinatario[]>(destinatariosMock);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDestinatarios = destinatarios.filter(
    (dest) =>
      dest.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dest.cpf && dest.cpf.includes(searchTerm)) ||
      (dest.cnpj && dest.cnpj.includes(searchTerm))
  );

  const handleEdit = (id: string) => {
    toast.info("Funcionalidade de edição em desenvolvimento");
  };

  const handleDelete = (id: string) => {
    toast.info("Funcionalidade de exclusão em desenvolvimento");
  };

  const handleCreate = () => {
    toast.info("Funcionalidade de cadastro em desenvolvimento");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Destinatários</h1>
          <p className="text-muted-foreground mt-2">
            Destinatários cadastrados: <span className="font-semibold text-foreground">{destinatarios.length}</span>
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-success">
          <Plus className="mr-2 h-4 w-4" />
          Novo Destinatário
        </Button>
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
                {filteredDestinatarios.map((dest) => (
                  <TableRow key={dest.id}>
                    <TableCell>
                      <Badge variant={dest.tipo === "PF" ? "default" : "secondary"}>
                        {dest.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{dest.nome}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {dest.cpf || dest.cnpj}
                    </TableCell>
                    <TableCell>
                      {dest.endereco.logradouro}, {dest.endereco.numero}
                      {dest.endereco.complemento && `, ${dest.endereco.complemento}`}
                    </TableCell>
                    <TableCell>{dest.telefone}</TableCell>
                    <TableCell>
                      {dest.endereco.cidade}/{dest.endereco.estado}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(dest.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(dest.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDestinatarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Nenhum destinatário encontrado
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
