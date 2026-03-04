# Pattern: Delete Confirmation z AlertDialog

**Źródło:** integration-hub v1.1 (Clients.tsx, Projects.tsx)  
**Technologie:** React, shadcn/ui AlertDialog, tRPC

## Problem
Usuwanie encji bez potwierdzenia prowadzi do przypadkowych strat danych.

## Rozwiązanie

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const [deleteId, setDeleteId] = useState<number | null>(null);
const entityToDelete = items?.find(i => i.id === deleteId);

const remove = trpc.entity.delete.useMutation({
  onSuccess: () => {
    utils.entity.list.invalidate();
    setDeleteId(null);
    toast.success("Usunięto.");
  },
  onError: (e) => toast.error(e.message),
});

// W karcie - przycisk delete widoczny tylko na hover
<Card className="group relative">
  <button
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteId(item.id); }}
    className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground
               hover:text-destructive hover:bg-destructive/10 transition-colors
               opacity-0 group-hover:opacity-100 z-10"
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>
  {/* reszta karty */}
</Card>

// AlertDialog potwierdzenia
<AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Usuń {entityToDelete?.name}</AlertDialogTitle>
      <AlertDialogDescription>
        Ta operacja jest nieodwracalna. Wszystkie powiązane dane zostaną usunięte.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Anuluj</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => deleteId && remove.mutate({ id: deleteId })}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {remove.isPending ? "Usuwanie..." : "Usuń"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Kluczowe zasady

- Przycisk delete widoczny tylko na hover (`opacity-0 group-hover:opacity-100`)
- `e.stopPropagation()` aby nie triggerować Link/Card click
- AlertDialog z pełnym opisem konsekwencji
- Invalidate cache po sukcesie
- Loading state w przycisku potwierdzenia (`isPending`)
- Backend: cascade delete powiązanych rekordów przed usunięciem głównego
