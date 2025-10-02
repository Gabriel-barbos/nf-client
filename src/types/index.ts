export interface Destinatario {
  _id: string;
  tipo: "PF" | "PJ";
  nome: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  createdAt: string;
}

export interface ItemPedido {
  id: string;
  descricao: string;
  quantidade: number;
  tipo: string;
  valorUnitario: number;
}

export interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  clienteId?: string;
  valor: number;
  itens: ItemPedido[];
  status: "pendente" | "emitido" | "erro";
  dataPedido: string;
}

export interface NotaFiscal {
  id: string;
  numero: string;
  serie: string;
  chave: string;
  pedidoId: string;
  destinatarioId: string;
  destinatarioNome: string;
  valor: number;
  status: "emitida" | "cancelada" | "erro";
  dataEmissao: string;
  pdfUrl?: string;
}
