
interface LogoProps {
  className?: string;
  isCollapsed?: boolean;
}

const Logo = ({ className = "h-48 w-48", isCollapsed }: LogoProps) => {
  // Ajustar tamanho baseado no estado colapsado
  const logoSize = isCollapsed ? "h-8 w-8" : "h-12 w-auto max-w-[180px]";
  
  return (
    <img 
      src="/lovable-uploads/3cb5528a-9cae-44e6-8078-9c3cfd533e2d.png" 
      alt="EnviaLead Logo" 
      className={`${logoSize} object-contain transition-all duration-300 ${className}`}
    />
  );
};

export default Logo;
