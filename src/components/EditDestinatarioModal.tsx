import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Destinatario {
  _id?: string;
  nome: string;
  tipo: string;
  cpf?: string;
  cnpj?: string;
  ie?: string;
  indicadorIe?: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface EditDestinatarioModalProps {
  destinatario: Destinatario;
  onUpdate: (id: string, data: Destinatario) => Promise<void>;
}

export default function EditDestinatarioModal({ destinatario, onUpdate }: EditDestinatarioModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Destinatario>(destinatario);

  useEffect(() => {
    if (open) setForm(destinatario);
  }, [open, destinatario]);

  const isPJ = form.cnpj && form.cnpj.trim() !== "";

  const handleSubmit = async () => {
    if (!form.nome || !form.endereco || !form.numero || !form.bairro || !form.cidade || !form.estado || !form.cep) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (isPJ && (!form.cnpj || !form.ie || !form.indicadorIe)) {
      toast.error("Preencha todos os campos obrigatórios para PJ");
      return;
    }
    if (!isPJ && !form.cpf) {
      toast.error("Preencha o CPF");
      return;
    }

    setLoading(true);
    try {
      await onUpdate(destinatario._id!, form);
      toast.success("Destinatário atualizado com sucesso!");
      setOpen(false);
    } catch (err) {
      toast.error("Erro ao atualizar destinatário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Destinatário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>

            {isPJ ? (
              <>
                <div>
                  <Label>CNPJ *</Label>
                  <Input
                    value={form.cnpj}
                    onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  />
                </div>
                <div>
                  <Label>IE *</Label>
                  <Input
                    value={form.ie || ""}
                    onChange={(e) => setForm({ ...form, ie: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Indicador IE *</Label>
                  <Select
                    value={form.indicadorIe || ""}
                    onValueChange={(v) => setForm({ ...form, indicadorIe: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Contribuinte ICMS</SelectItem>
                      <SelectItem value="2">Contribuinte isento</SelectItem>
                      <SelectItem value="9">Não Contribuinte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <Label>CPF *</Label>
                <Input
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                />
              </div>
            )}

            <div className="col-span-2">
              <Label>Endereço *</Label>
              <Input
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              />
            </div>

            <div>
              <Label>Número *</Label>
              <Input
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
              />
            </div>

            <div>
              <Label>Complemento *</Label>
              <Input
                value={form.complemento || ""}
                onChange={(e) => setForm({ ...form, complemento: e.target.value })}
              />
            </div>

            <div>
              <Label>Bairro *</Label>
              <Input
                value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
              />
            </div>

            <div>
              <Label>Cidade *</Label>
              <Input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              />
            </div>

            <div>
              <Label>Estado *</Label>
              <Input
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                maxLength={2}
              />
            </div>

            <div>
              <Label>CEP *</Label>
              <Input
                value={form.cep}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}