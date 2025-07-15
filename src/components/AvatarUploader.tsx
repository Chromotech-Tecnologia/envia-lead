import { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploaderProps {
  onAvatarSelect: (url: string) => void;
  selectedAvatar?: string;
  companyId: string;
}

const AvatarUploader = ({ onAvatarSelect, selectedAvatar, companyId }: AvatarUploaderProps) => {
  const [savedAvatars, setSavedAvatars] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [avatarName, setAvatarName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Predefined avatars
  const predefinedAvatars = [
    '👨‍💼', '👩‍💼', '🤖', '💬', '🎯', '🚀', '💎', '⭐',
    '🌟', '💫', '🔥', '⚡', '🎉', '🎊', '🌈', '🦄'
  ];

  // Load saved avatars
  const loadSavedAvatars = async () => {
    const { data, error } = await supabase
      .from('saved_avatars')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading avatars:', error);
      return;
    }

    setSavedAvatars(data || []);
  };

  // Upload new avatar
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${companyId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('saved_avatars')
        .insert({
          company_id: companyId,
          url: publicUrl,
          name: avatarName || `Avatar ${Date.now()}`,
        });

      if (dbError) throw dbError;

      // Update the selected avatar immediately
      onAvatarSelect(publicUrl);
      
      // Reload saved avatars
      loadSavedAvatars();
      
      // Clear form
      setAvatarName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: 'Sucesso',
        description: 'Avatar enviado com sucesso!',
      });

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar avatar.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete saved avatar
  const deleteSavedAvatar = async (avatar: any) => {
    try {
      const { error } = await supabase
        .from('saved_avatars')
        .delete()
        .eq('id', avatar.id);

      if (error) throw error;

      // Remove from storage
      const path = avatar.url.split('/avatars/')[1];
      if (path) {
        await supabase.storage.from('avatars').remove([path]);
      }

      loadSavedAvatars();

      toast({
        title: 'Sucesso',
        description: 'Avatar removido com sucesso!',
      });

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover avatar.',
        variant: 'destructive',
      });
    }
  };

  // Load avatars on mount
  useState(() => {
    loadSavedAvatars();
  });

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label>Enviar Novo Avatar</Label>
            
            <div className="space-y-3">
              <Input
                placeholder="Nome do avatar (opcional)"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
              />
              
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Selecionar Imagem'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predefined Avatars */}
      <Card>
        <CardContent className="pt-6">
          <Label className="mb-4 block">Avatars Predefinidos</Label>
          <div className="grid grid-cols-8 gap-2">
            {predefinedAvatars.map((emoji, index) => (
              <Button
                key={index}
                variant={selectedAvatar === emoji ? "default" : "outline"}
                className="aspect-square p-0 text-xl relative"
                onClick={() => onAvatarSelect(emoji)}
              >
                {emoji}
                {selectedAvatar === emoji && (
                  <Check className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-white rounded-full p-0.5" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Saved Avatars */}
      {savedAvatars.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Label className="mb-4 block">Avatars Salvos</Label>
            <div className="grid grid-cols-4 gap-3">
              {savedAvatars.map((avatar) => (
                <div key={avatar.id} className="relative group">
                  <Button
                    variant={selectedAvatar === avatar.url ? "default" : "outline"}
                    className="aspect-square p-1 w-full relative overflow-hidden"
                    onClick={() => onAvatarSelect(avatar.url)}
                  >
                    <img 
                      src={avatar.url} 
                      alt={avatar.name}
                      className="w-full h-full object-cover rounded"
                    />
                    {selectedAvatar === avatar.url && (
                      <Check className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-white rounded-full p-0.5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteSavedAvatar(avatar)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  
                  <p className="text-xs text-center mt-1 truncate">
                    {avatar.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AvatarUploader;