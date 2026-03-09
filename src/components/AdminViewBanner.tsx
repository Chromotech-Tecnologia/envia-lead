import { useAdminView } from '@/contexts/AdminViewContext';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

const AdminViewBanner = () => {
  const { isViewingAsOther, viewingAsCompanyName, clearViewingAs } = useAdminView();

  if (!isViewingAsOther) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between z-50">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Eye className="h-4 w-4" />
        Visualizando como: <strong>{viewingAsCompanyName}</strong>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={clearViewingAs}
        className="text-white hover:bg-white/20 gap-1"
      >
        <X className="h-4 w-4" />
        Voltar
      </Button>
    </div>
  );
};

export default AdminViewBanner;
