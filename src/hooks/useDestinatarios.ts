import { useEffect, useState } from "react";

// Defina o tipo conforme sua API
export interface Destinatario {
  _id?: string;
  nome: string;
  apelido?: string;
  tipo: string;
  sexo?: string;
  cpf?: string;
  rg?: string;
  expedicaoRg?: string;
  ufRg?: string;
  indicadorIe?: string;
  cnpj?: string;
  ie?: string;
  telefone?: string;
  celular?: string;
  fax?: string;
  email?: string;
  site?: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  dataNascimento?: string;
  createdAt?: string;
}

const API_URL = "https://nf-software.onrender.com/destinatarios";
export function useDestinatarios() {
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinatarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Erro ao buscar destinatários");
      const data: Destinatario[] = await res.json();
      setDestinatarios(data);
    } catch (err: any) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const createDestinatario = async (novo: Destinatario) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
    if (!res.ok) throw new Error("Erro ao criar destinatário");
    const created = await res.json();
    setDestinatarios((prev) => [...prev, created]);
    return created;
  };

  const updateDestinatario = async (id: string, atualizado: Destinatario) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado),
    });
    if (!res.ok) throw new Error("Erro ao atualizar destinatário");
    const updated = await res.json();
    setDestinatarios((prev) =>
      prev.map((d) => (d._id === id ? updated : d))
    );
    return updated;
  };

  const patchDestinatario = async (id: string, campos: Partial<Destinatario>) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campos),
    });
    if (!res.ok) throw new Error("Erro ao aplicar patch");
    const updated = await res.json();
    setDestinatarios((prev) =>
      prev.map((d) => (d._id === id ? updated : d))
    );
    return updated;
  };

  const deleteDestinatario = async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao excluir destinatário");
    setDestinatarios((prev) => prev.filter((d) => d._id !== id));
  };

  useEffect(() => {
    fetchDestinatarios();
  }, []);

  return {
    destinatarios,
    loading,
    error,
    refetch: fetchDestinatarios,
    createDestinatario,
    updateDestinatario,
    patchDestinatario,
    deleteDestinatario,
  };
}
