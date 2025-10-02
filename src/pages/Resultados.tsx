import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Download, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Resultados() {
  const location = useLocation();
  const navigate = useNavigate();
  const resultados = location.state?.resultados || [];

  const notasSucesso = resultados.filter(r => r.sucesso);
  const notasErro = resultados.filter(r => !r.sucesso);

  const baixarPDF = (resultado) => {
    if (!resultado.pdf) return;
    
    const linkSource = `data:application/pdf;base64,${resultado.pdf}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = `NF-${resultado.numero}_${resultado.destinatario}.pdf`;
    downloadLink.click();
  };

  const baixarTodas = () => {
    notasSucesso.forEach((resultado, index) => {
      setTimeout(() => baixarPDF(resultado), index * 500);
    });
  };

  if (!resultados.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-6">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground mb-4">
          Nenhum resultado disponível
        </p>
        <Button onClick={() => navigate('/pedidos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resultados da Emissão</h1>
          <p className="text-muted-foreground mt-2">
            Total processado: <span className="font-semibold">{resultados.length}</span>
            {' • '}
            <span className="text-green-600 font-semibold">{notasSucesso.length} sucesso</span>
            {notasErro.length > 0 && (
              <>
                {' • '}
                <span className="text-red-600 font-semibold">{notasErro.length} erro(s)</span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/pedidos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          {notasSucesso.length > 0 && (
            <Button onClick={baixarTodas}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Todas ({notasSucesso.length})
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resultados.map((resultado, index) => (
          <Card
            key={index}
            className={`${
              resultado.sucesso
                ? "border-green-200 bg-green-50/50"
                : "border-red-200 bg-red-50/50"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    {resultado.sucesso ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>NF-e #{resultado.numero}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <span>Erro na Emissão</span>
                      </>
                    )}
                  </CardTitle>
                  {resultado.sucesso && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {resultado.destinatario}
                    </p>
                  )}
                </div>
                {resultado.sucesso ? (
                  <Badge className="bg-green-600">Autorizada</Badge>
                ) : (
                  <Badge variant="destructive">Rejeitada</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {resultado.sucesso ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Número:</span>
                      <span className="font-medium">{resultado.numero}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Protocolo:</span>
                      <span className="font-mono text-xs">{resultado.protocolo}</span>
                    </div>

                    <div className="border-t pt-2">
                      <p className="text-xs text-muted-foreground mb-1">Chave de Acesso:</p>
                      <p className="font-mono text-xs break-all">{resultado.chave}</p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => baixarPDF(resultado)}
                    disabled={!resultado.pdf}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Erro ao processar NF-e
                    </p>
                    <p className="text-xs text-red-700">
                      {resultado.erro}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pedido ID: {resultado.pedidoId}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}