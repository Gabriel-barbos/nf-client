import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Building2, MapPin } from "lucide-react"
import { useDestinatarios } from "@/hooks/useDestinatarios";

interface Props {
  onClose: () => void
}

export default function DestinatarioForm({ onClose }: Props) {
  const [isCnpj, setIsCnpj] = useState(false)
    const { createDestinatario } = useDestinatarios();

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
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
    cep: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, indicadorIe: value }))
  }

 const handleSubmit = async () => {
    const requiredFields = isCnpj
      ? ['nome', 'cnpj', 'ie', 'indicadorIe', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep']
      : ['nome', 'cpf', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep'];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]?.trim()
    );

    if (missingFields.length > 0) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const novo = await createDestinatario(formData); // 👈 aqui conecta no backend
      alert("Destinatário cadastrado com sucesso!");
      console.log("Criado:", novo);
    } catch (err: any) {
      alert("Erro ao salvar destinatário: " + err.message);
    }
  };
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          {/* Tipo de Pessoa */}
          <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className={`text-sm font-medium transition-colors ${!isCnpj ? 'text-blue-600' : 'text-slate-500'}`}>
              Pessoa Física
            </span>
            <Switch
              checked={isCnpj}
              onCheckedChange={setIsCnpj}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-sm font-medium transition-colors ${isCnpj ? 'text-blue-600' : 'text-slate-500'}`}>
              Pessoa Jurídica
            </span>
          </div>

          <Separator />

          {/* Identificação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700">
              {isCnpj ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
              <h3 className="font-semibold">Identificação</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm">Nome / Razão Social *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo ou razão social"
              />
            </div>

            {!isCnpj ? (
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm">CPF *</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-sm">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ie" className="text-sm">Inscrição Estadual *</Label>
                    <Input
                      id="ie"
                      name="ie"
                      value={formData.ie}
                      onChange={handleChange}
                      placeholder="000.000.000.000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="indicadorIe" className="text-sm">Indicador IE *</Label>
                  <Select value={formData.indicadorIe} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contribuinte">Contribuinte ICMS</SelectItem>
                      <SelectItem value="isento">Contribuinte isento de inscrição</SelectItem>
                      <SelectItem value="nao-contribuinte">Não Contribuinte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Endereço */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4" />
              <h3 className="font-semibold">Endereço</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="endereco" className="text-sm">Logradouro *</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero" className="text-sm">Número *</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="complemento" className="text-sm">Complemento *</Label>
                <Input
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Apto, Sala..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro" className="text-sm">Bairro *</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Nome do bairro"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-sm">Cidade *</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Nome da cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm">UF *</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  placeholder="SP"
                  maxLength={2}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-sm">CEP *</Label>
                <Input
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Fixo */}
      <div className="border-t bg-muted/50 p-6">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}