import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, Pencil, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePedidos } from "@/hooks/usePedidos";

export default function Pedidos() {
  const navigate = useNavigate();
  const { pedidos, loading, error, emitirNotas, salvarEdicao, obterEdicao } = usePedidos();
  const [selected, setSelected] = useState(new Set());
  const [emitting, setEmitting] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formEdicao, setFormEdicao] = useState({ quantidade: 0, dispositivo: "" });

  const toggle = (id) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const toggleAll = () => {
    setSelected(selected.size === pedidos.length ? new Set() : new Set(pedidos.map(p => p.ID)));
  };

  const abrirEdicao = (pedido, e) => {
    e.stopPropagation();
    const edicoes = obterEdicao(pedido.ID);
    setFormEdicao({
      quantidade: edicoes.Quantidade_de_Dispositivos || pedido.Quantidade_de_Dispositivos,
      dispositivo: edicoes.Dispositivo?.display_value || pedido.Dispositivo?.display_value || ""
    });
    setEditando(pedido);
  };

  const salvarEdicaoLocal = () => {
    salvarEdicao(editando.ID, 'Quantidade_de_Dispositivos', formEdicao.quantidade);
    salvarEdicao(editando.ID, 'Dispositivo', { display_value: formEdicao.dispositivo });
    setEditando(null);
  };

  const handleEmitir = async () => {
    if (selected.size === 0) return;
    setEmitting(true);
    
    const result = await emitirNotas(Array.from(selected));
    
    setEmitting(false);
    
    if (result.success) {
      navigate('/resultados', { state: { resultados: result.resultados } });
    } else {
      alert(result.error);
    }
  };

  const formatEndereco = (p) => {
    const parts = [p.Rua, p.Bairro, p.Cidade, p.Estado, p.CEP].filter(Boolean);
    return parts.join(', ');
  };

  const obterValorExibicao = (pedido, campo) => {
    const edicoes = obterEdicao(pedido.ID);
    if (campo === 'quantidade') {
      return edicoes.Quantidade_de_Dispositivos || pedido.Quantidade_de_Dispositivos || 0;
    }
    if (campo === 'dispositivo') {
      return edicoes.Dispositivo?.display_value || pedido.Dispositivo?.display_value || "-";
    }
    return "-";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20"></div>
          <Loader2 className="h-16 w-16 animate-spin text-primary absolute inset-0" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Carregando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8 border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Erro ao carregar</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos - Emissão NF</h1>
          </div>
          <p className="text-muted-foreground">
            Total de pedidos: <Badge variant="secondary" className="ml-2">{pedidos.length}</Badge>
            {selected.size > 0 && (
              <span className="ml-2">
                • <span className="font-semibold text-primary">{selected.size}</span> selecionado{selected.size > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={toggleAll} 
            disabled={!pedidos.length}
            className="transition-all hover:border-primary/50"
          >
            {selected.size === pedidos.length ? "Desmarcar" : "Selecionar"} Todos
          </Button>
          <Button 
            onClick={handleEmitir} 
            disabled={!selected.size || emitting}
            className="min-w-[140px] transition-all shadow-md hover:shadow-lg"
          >
            {emitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Emitindo...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Emitir {selected.size > 0 && `${selected.size} `}Nota{selected.size > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pedidos.map((p) => (
          <Card
            key={p.ID}
            className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
              selected.has(p.ID) 
                ? "ring-2 ring-primary shadow-lg border-primary/50" 
                : "hover:border-primary/30"
            }`}
            onClick={() => toggle(p.ID)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Checkbox
                    checked={selected.has(p.ID)}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(p.ID);
                    }}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">
                      {p.Cadastro_Cliente?.display_value || "Sem cadastro"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pedido <span className="font-mono font-semibold">#{p.Numero}</span>
                    </p>
                  </div>
                </div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  p.temDestinatario 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {p.temDestinatario ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {!p.temDestinatario && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <p className="text-xs font-medium text-orange-800 dark:text-orange-300">
                      Destinatário não cadastrado
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Formulário de cadastro será implementado');
                    }}
                  >
                    Cadastrar Destinatário
                  </Button>
                </div>
              )}

              <div className="space-y-3 bg-muted/30 rounded-lg p-3">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{p.Sub_Cliente?.display_value || "-"}</span>
                </div>
                
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Destinatário:</span>
                  <span className="font-medium truncate ml-2">{p.Nome || "-"}</span>
                </div>

                <div className="flex justify-between items-center text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {obterValorExibicao(p, 'quantidade')} un.
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-primary/10"
                      onClick={(e) => abrirEdicao(p, e)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-primary mb-2 tracking-wide">EQUIPAMENTOS</p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Dispositivo:</span>
                  <span className="text-xs text-right font-medium">{obterValorExibicao(p, 'dispositivo')}</span>
                </div>

                {p.Acessorios?.display_value && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Acessórios:</span>
                    <span className="text-xs text-right font-medium">{p.Acessorios.display_value}</span>
                  </div>
                )}

                {p.Chicote?.display_value && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Chicote:</span>
                    <span className="text-xs text-right font-medium">{p.Chicote.display_value}</span>
                  </div>
                )}
              </div>

              {formatEndereco(p) && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-primary mb-2 tracking-wide">ENDEREÇO</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formatEndereco(p)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!pedidos.length && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              Nenhum pedido pendente
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os pedidos foram processados
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pencil className="h-4 w-4 text-primary" />
              </div>
              Editar Pedido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade" className="text-sm font-medium">
                Quantidade de Dispositivos
              </Label>
              <Input
                id="quantidade"
                type="number"
                value={formEdicao.quantidade}
                onChange={(e) => setFormEdicao({ ...formEdicao, quantidade: parseInt(e.target.value) || 0 })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispositivo" className="text-sm font-medium">
                Dispositivo
              </Label>
              <Input
                id="dispositivo"
                value={formEdicao.dispositivo}
                onChange={(e) => setFormEdicao({ ...formEdicao, dispositivo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicaoLocal} className="shadow-md">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}