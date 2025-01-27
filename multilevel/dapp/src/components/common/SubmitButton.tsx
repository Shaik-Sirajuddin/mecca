import { clsx } from "clsx";

interface ButtonProps {
  btnStyle?: string;
  onClick?: () => void;
  disabled?: boolean;
  btnText: string;
}

export const SubmitButton = ({
  btnText,
  btnStyle,
  onClick,
  disabled,
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type="submit"
      className={clsx(
        "text-base relative flex items-center justify-center text-center w-full mt-6 uppercase text-white font-semibold",
        btnStyle
      )}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 426 41"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 7.58831C0 7.11587 0.167242 6.65869 0.47209 6.29777L4.90076 1.05452C5.28077 0.604618 5.83975 0.345062 6.42867 0.345062H424C425.105 0.345062 426 1.24049 426 2.34506V33.636C426 34.0662 425.861 34.4849 425.604 34.8301L422.1 39.5391C421.722 40.0462 421.128 40.3451 420.495 40.3451H2C0.895426 40.3451 0 39.4496 0 38.3451V7.58831Z"
          fill="#D107FB"
        />
      </svg>

      <span className="absolute">{btnText}</span>
    </button>
  );
};
