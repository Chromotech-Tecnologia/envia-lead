
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from 'lucide-react';

interface FlowSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const FlowSearch = ({ searchTerm, onSearchChange }: FlowSearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar fluxos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
          <Plus className="w-4 h-4 mr-2" />
          Importar Fluxo
        </Button>
        <Button className="envia-lead-gradient hover:opacity-90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Fluxo
        </Button>
      </div>
    </div>
  );
};

export default FlowSearch;
