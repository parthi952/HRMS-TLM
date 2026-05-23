import { cardTheme } from "../Themes/ComponentsThems/CardTheme";

interface CardProps {
  CardTitle: string;
  NameOfIMG: string;
  IMG: string;
  onClick?: () => void;
}

export const Card = ({ IMG, CardTitle, NameOfIMG, onClick }: CardProps) => {
  return (
    <div 
      className={`${cardTheme.wrapper} p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200 cursor-pointer group`}
      onClick={onClick}
    >
      <h1 className="text-[20px] font-black text-slate-800 mb-6 group-hover:text-primary transition-colors">
        {CardTitle}
      </h1>

      <div className="overflow-hidden rounded-2xl bg-slate-50/50 flex items-center justify-center p-4">
        <img
          src={IMG}
          alt={NameOfIMG}
          className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    </div>
  );
};
