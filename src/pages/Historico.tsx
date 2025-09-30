import { useState } from "react";
import { History as HistoryIcon, Download, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { NotaFiscal } from "@/types";

// Dados mockados
const notasMock: NotaFiscal[] = [
  {
    id: "nf-1",
    numero: "000001",
    serie: "1",
    chave: "35240112345678901234567890123456789012345678",
    pedidoId: "ped-1",
    destinatarioId: "dest-1",
    destinatarioNome: "João Silva",
    valor: 15000,
    status: "emitida",
    dataEmissao: "2024-01-20T10:30:00",
    pdfUrl: "#",
  },
  {
    id: "nf-2",
    numero: "000002",
    serie: "1",
    chave: "35240112345678901234567890123456789012345679",
    pedidoId: "ped-2",
    destinatarioId: "dest-2",
    destinatarioNome: "Empresa ABC Ltda",
    valor: 25000,
    status: "emitida",
    dataEmissao: "2024-01-21T14:15:00",
    pdfUrl: "#",
  },
  {
    id: "nf-3",
    numero: "000003",
    serie: "1",
    chave: "35240112345678901234567890123456789012345680",
    pedidoId: "ped-3",
    destinatarioId: "dest-3",
    destinatarioNome: "Maria Santos",
    valor: 8500,
    status: "emitida",
    dataEmissao: "2024-01-22T09:45:00",
    pdfUrl: "#",
  },
];

export default function Historico() {
  const [notas] = useState<NotaFiscal[]>(notasMock);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotas = notas.filter(
    (nota) =>
      nota.numero.includes(searchTerm) ||
      nota.destinatarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.chave.includes(searchTerm)
  );

  const handleDownloadPDF = (notaId: string, numero: string) => {
    toast.success(`Download da NF-e ${numero} iniciado`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalValor = filteredNotas.reduce((sum, nota) => sum + nota.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Histórico de Notas</h1>
        <p className="text-muted-foreground mt-1">
          Consulte todas as notas fiscais emitidas
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <span className="text-xl">R$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Emissão</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {notas.length > 0
                ? formatDate(notas[0].dataEmissao).split(" ")[0]
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Buscar por número, destinatário ou chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chave de Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotas.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell className="font-medium">
                      {nota.numero}/{nota.serie}
                    </TableCell>
                    <TableCell>{formatDate(nota.dataEmissao)}</TableCell>
                    <TableCell>{nota.destinatarioNome}</TableCell>
                    <TableCell>
                      R$ {nota.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          nota.status === "emitida"
                            ? "default"
                            : nota.status === "cancelada"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {nota.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {nota.chave}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(nota.id, nota.numero)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredNotas.length === 0 && (
                  <TableRow>
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Nenhuma nota fiscal encontrada
                        </p>
                      </TableCell>
                    </TableRow>
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
