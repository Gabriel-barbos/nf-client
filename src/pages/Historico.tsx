import { useState, useEffect } from "react";
import { History as HistoryIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type NotaAPI = {
  _id: string;
  numero: number;
  eventoId: string;
  dataAutorizacao: string;
  protocolo: string;
  destinatario: string;
  createdAt: string;
  updatedAt: string;
};

export default function Historico() {
  const [notas, setNotas] = useState<NotaAPI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const res = await fetch("https://nf-software.onrender.com/nota/historico");
        if (!res.ok) throw new Error("Erro ao buscar notas fiscais");

        const data = await res.json();
        console.log("Resposta API:", data);

        setNotas(data.dados || []);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar histórico de notas");
        setNotas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, []);

  const filteredNotas = notas.filter(
    (nota) =>
      nota.numero.toString().includes(searchTerm) ||
      nota.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.protocolo.includes(searchTerm)
  );

  // Paginação aplicada nos resultados filtrados
  const totalPages = Math.ceil(filteredNotas.length / itemsPerPage);
  const paginatedNotas = filteredNotas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownloadPDF = async (eventoId: string, numero: number) => {
    try {
      const res = await fetch(`https://nf-software.onrender.com/nota/${eventoId}/pdf`);
      if (!res.ok) throw new Error("Erro ao baixar PDF");

      const data = await res.json();

      // Decodifica base64 em binário
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], {
        type: data.mimeType || "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `nota-${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`Download da NF-e ${numero} concluído`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao baixar PDF");
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Histórico de Notas</h1>
        <p className="text-muted-foreground mt-2">
          Consulte todas as notas fiscais emitidas
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Buscar por número, destinatário ou protocolo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset na busca
            }}
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
                  <TableHead>Protocolo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando notas...
                    </TableCell>
                  </TableRow>
                ) : paginatedNotas.length > 0 ? (
                  paginatedNotas.map((nota) => (
                    <TableRow key={nota._id}>
                      <TableCell className="font-medium">{nota.numero}</TableCell>
                      <TableCell>{formatDate(nota.dataAutorizacao)}</TableCell>
                      <TableCell>{nota.destinatario}</TableCell>
                      <TableCell>{nota.protocolo}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownloadPDF(nota.eventoId, nota.numero)
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhuma nota fiscal encontrada
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {!loading && filteredNotas.length > 0 && (
            <div className="flex justify-end items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
