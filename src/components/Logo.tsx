
interface LogoProps {
  className?: string;
}

const Logo = ({ className = "h-8 w-8" }: LogoProps) => {
  return (
    <div className={`${className} bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center`}>
      <span className="text-white font-bold text-sm">EL</span>
    </div>
  );
};

export default Logo;
