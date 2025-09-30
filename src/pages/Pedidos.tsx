import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pedido } from "@/types";

// Dados mockados para demonstração
const pedidosMock: Pedido[] = [
  {
    id: "1",
    numero: "PED-2024-001",
    cliente: "João Silva",
    clienteId: "dest-1",
    valor: 15000,
    status: "pendente",
    dataPedido: "2024-01-15",
    itens: [
      { id: "1", descricao: "Notebook Dell", quantidade: 2, tipo: "Eletrônico", valorUnitario: 5000 },
      { id: "2", descricao: "Mouse Wireless", quantidade: 5, tipo: "Periférico", valorUnitario: 100 },
    ],
  },
  {
    id: "2",
    numero: "PED-2024-002",
    cliente: "Maria Santos",
    valor: 8500,
    status: "pendente",
    dataPedido: "2024-01-16",
    itens: [
      { id: "3", descricao: "Monitor LG 27'", quantidade: 3, tipo: "Eletrônico", valorUnitario: 2500 },
      { id: "4", descricao: "Teclado Mecânico", quantidade: 2, tipo: "Periférico", valorUnitario: 400 },
    ],
  },
  {
    id: "3",
    numero: "PED-2024-003",
    cliente: "Empresa ABC Ltda",
    clienteId: "dest-3",
    valor: 25000,
    status: "pendente",
    dataPedido: "2024-01-17",
    itens: [
      { id: "5", descricao: "Desktop Workstation", quantidade: 5, tipo: "Computador", valorUnitario: 5000 },
    ],
  },
];

export default function Pedidos() {
  const [pedidos] = useState<Pedido[]>(pedidosMock);
  const [selectedPedidos, setSelectedPedidos] = useState<Set<string>>(new Set());
  const [isEmitting, setIsEmitting] = useState(false);

  const togglePedido = (id: string) => {
    const newSelected = new Set(selectedPedidos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPedidos(newSelected);
  };

  const toggleAll = () => {
    if (selectedPedidos.size === pedidos.length) {
      setSelectedPedidos(new Set());
    } else {
      setSelectedPedidos(new Set(pedidos.map((p) => p.id)));
    }
  };

  const emitirNotas = async () => {
    if (selectedPedidos.size === 0) {
      toast.error("Selecione pelo menos um pedido");
      return;
    }

    setIsEmitting(true);
    
    // Simulação de emissão
    setTimeout(() => {
      toast.success(`${selectedPedidos.size} nota(s) emitida(s) com sucesso!`);
      setSelectedPedidos(new Set());
      setIsEmitting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pedidos Pendentes</h1>
          <p className="text-muted-foreground mt-2">
            Pedidos com NF pendente: <span className="font-semibold text-foreground">{pedidos.length}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={toggleAll}
            disabled={pedidos.length === 0}
          >
            {selectedPedidos.size === pedidos.length ? "Desmarcar" : "Selecionar"} Todos
          </Button>
          <Button
            onClick={emitirNotas}
            disabled={selectedPedidos.size === 0 || isEmitting}
            className="bg-gradient-primary"
          >
            {isEmitting ? "Emitindo..." : `Emitir Nota${selectedPedidos.size > 1 ? "s" : ""}`}
            {selectedPedidos.size > 0 && ` (${selectedPedidos.size})`}
          </Button>
        </div>
      </div>

      {/* Pedidos List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pedidos.map((pedido) => (
          <Card
            key={pedido.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPedidos.has(pedido.id) ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => togglePedido(pedido.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedPedidos.has(pedido.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePedido(pedido.id);
                    }}
                  />
                  <div>
                    <CardTitle className="text-lg">{pedido.numero}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{pedido.cliente}</p>
                  </div>
                </div>
                {pedido.clienteId ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Itens do Pedido:</p>
                <div className="space-y-2">
                  {pedido.itens.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantidade}x {item.descricao}
                      </span>
                      <Badge variant="secondary">{item.tipo}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">Valor Total</span>
                <span className="text-lg font-bold text-foreground">
                  R$ {pedido.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {!pedido.clienteId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info("Funcionalidade de cadastro em desenvolvimento");
                  }}
                >
                  Criar Destinatário
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {pedidos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium text-muted-foreground">
              Nenhum pedido pendente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
