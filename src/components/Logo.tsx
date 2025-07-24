
interface LogoProps {
  className?: string;
  isCollapsed?: boolean;
}

const Logo = ({ className = "h-12 w-12", isCollapsed }: LogoProps) => {
  return (
    <img 
      src="/lovable-uploads/3cb5528a-9cae-44e6-8078-9c3cfd533e2d.png" 
      alt="EnviaLead Logo" 
      className={className}
    />
  );
};

export default Logo;
