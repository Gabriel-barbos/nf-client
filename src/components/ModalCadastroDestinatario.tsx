import { useState } from "react";
import { Loader2, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDestinatarios } from "@/hooks/useDestinatarios";

export default function ModalCadastroDestinatario({ open, onOpenChange, pedido, onSuccess }) {
  const { createDestinatario } = useDestinatarios();
  const [tipo, setTipo] = useState("PF");
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    cnpj: "",
    ie: "",
    indicadorIe: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  const atualizarCampo = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const validarFormulario = () => {
    if (tipo === "PF") {
      const obrigatorios = ["nome", "cpf", "endereco", "numero", "complemento", "bairro", "cidade", "estado", "cep"];
      return obrigatorios.every(campo => form[campo]?.trim());
    } else {
      const obrigatorios = ["nome", "cnpj", "ie", "endereco", "numero", "complemento", "bairro", "cidade", "estado", "cep", "indicadorIe"];
      return obrigatorios.every(campo => form[campo]?.trim());
    }
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setSalvando(true);
    try {
      const dados = {
        nome: form.nome,
        tipo,
        endereco: form.endereco,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        cep: form.cep,
        ...(tipo === "PF" ? { cpf: form.cpf } : { cnpj: form.cnpj, ie: form.ie, indicadorIe: form.indicadorIe })
      };

      await createDestinatario(dados);
      onSuccess?.();
    } catch (err) {
      alert(err.message || "Erro ao cadastrar destinatário");
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setForm({
      nome: "",
      cpf: "",
      cnpj: "",
      ie: "",
      indicadorIe: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Cadastrar Destinatário
            {pedido && (
              <span className="text-sm font-normal text-muted-foreground">
                • Pedido #{pedido.Numero}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={tipo === "PF" ? "default" : "outline"}
              onClick={() => setTipo("PF")}
              className="flex-1 gap-2"
            >
              <User className="h-4 w-4" />
              Pessoa Física
            </Button>
            <Button
              type="button"
              variant={tipo === "PJ" ? "default" : "outline"}
              onClick={() => setTipo("PJ")}
              className="flex-1 gap-2"
            >
              <Building2 className="h-4 w-4" />
              Pessoa Jurídica
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                placeholder={tipo === "PF" ? "Nome completo" : "Razão social"}
              />
            </div>

            {tipo === "PF" ? (
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={(e) => atualizarCampo("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={form.cnpj}
                      onChange={(e) => atualizarCampo("cnpj", e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ie">Inscrição Estadual *</Label>
                    <Input
                      id="ie"
                      value={form.ie}
                      onChange={(e) => atualizarCampo("ie", e.target.value)}
                      placeholder="000.000.000.000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="indicadorIe">Indicador IE *</Label>
                  <Select
                    value={form.indicadorIe}
                    onValueChange={(value) => atualizarCampo("indicadorIe", value)}
                  >
                    <SelectTrigger id="indicadorIe">
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
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-4">Endereço</h4>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="endereco">Logradouro *</Label>
                    <Input
                      id="endereco"
                      value={form.endereco}
                      onChange={(e) => atualizarCampo("endereco", e.target.value)}
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={form.numero}
                      onChange={(e) => atualizarCampo("numero", e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento *</Label>
                  <Input
                    id="complemento"
                    value={form.complemento}
                    onChange={(e) => atualizarCampo("complemento", e.target.value)}
                    placeholder="Apto, Sala, Bloco..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      value={form.bairro}
                      onChange={(e) => atualizarCampo("bairro", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={form.cep}
                      onChange={(e) => atualizarCampo("cep", e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={form.cidade}
                      onChange={(e) => atualizarCampo("cidade", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      value={form.estado}
                      onChange={(e) => atualizarCampo("estado", e.target.value)}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={salvando || !validarFormulario()}
            className="shadow-md"
          >
            {salvando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Cadastrar Destinatário"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}