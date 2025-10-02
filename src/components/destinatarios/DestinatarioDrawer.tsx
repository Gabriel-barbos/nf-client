import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import DestinatarioForm from "./DestinatarioForm"

export default function DestinatarioDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Novo Destinatário
        </Button>
      </SheetTrigger>

      <SheetContent 
        side="right" 
        className="w-[500px] sm:w-[540px] flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              Cadastrar Destinatário
            </SheetTitle>
          
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <DestinatarioForm onClose={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}