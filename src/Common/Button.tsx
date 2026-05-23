import { buttonTheme } from "../Themes/ComponentsThems/ButtonTheme";

interface ButtonProps {
  B_name: string;
  ClickToAction: () => void;
  variant?: keyof typeof buttonTheme;
}

export const Button: React.FC<ButtonProps> = ({
  B_name,
  ClickToAction,
  variant = "primary"
}) => {
  return (
    <div>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${buttonTheme[variant]}`}
        onClick={ClickToAction}
      >
        {B_name}
      </button>
    </div>
  );
};
