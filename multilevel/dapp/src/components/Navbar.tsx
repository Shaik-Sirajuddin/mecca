import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const navLinks = [
  { id: 1, title: "Home", href: "/" },
  { id: 2, title: "How", href: "/how" },
  { id: 3, title: "My Dashboard", href: "/dashboard" },
  { id: 4, title: "My CREW", href: "/crew" },
  { id: 5, title: "Organization Chart", href: "/organization-chart" },
];

export const Navbar = () => {
  const location = useLocation().pathname;

  const [toggleMenu, setToggleMenu] = useState(false);

  const handleToggleMenu = () => {
    setToggleMenu((pre) => !pre);
  };

  return (
    <header className="absolute top-0 lg:top-9 w-full left-0 z-50">
      <nav className="w-full max-w-[1162px] px-4 mx-auto bg-pink10 lg:rounded-lg py-3 backdrop-blur-lg border border-white/20">
        <div className="w-full flex items-center justify-between gap-10">
          <Link
            to="/"
            className="text-gray2 relative z-20 text-sm font-poppins transition-all duration-200 hover:brightness-150"
          >
            <img
              src="Mecca-Logo.png"
              className="w-[141px] h-auto object-contain"
              alt="Mecca logo"
            />
          </Link>
          <ul
            className={clsx(
              "flex lg:flex-row overflow-hidden lg:py-3 lg:translate-y-0 transition-all duration-300 flex-col py-16 lg:h-auto h-screen top-[62px] lg:static absolute lg:bg-transparent lg:bg-none bg-[url(mecca-banner-bg.png)] bg-no-repeat bg-cover bg-center lg:top-auto  lg:w-fit w-full lg:left-auto left-0 items-center gap-8 lg:gap-10 ",
              toggleMenu ? "translate-y-[0vh]" : "-translate-y-[120vh]"
            )}
          >
            <li className="w-full lg:hidden h-screen bg-black4/30 absolute top-0 left-0 z-0"></li>
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <li key={link.id} className="relative">
                  <Link
                    to={link.href}
                    className={`text-gray2 lg:text-sm text-2xl font-poppins hover:text-gray1 transition-all duration-200 ${
                      isActive
                        ? "text-magenta1 lg:text-base text-2xl font-semibold hover:text-magenta1"
                        : ""
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      handleToggleMenu();
                    }}
                  >
                    {link.title}
                  </Link>
                  {isActive && (
                    <div className="bg-nav-active w-full absolute h-1 -bottom-1 z-10"></div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-4 relative z-20">
            <WalletMultiButton
              style={{
                // background: "rgb(209 7 251)",
                whiteSpace: "nowrap",
                background: "url(wallet_bg.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            />

            <button onClick={handleToggleMenu} className="lg:hidden">
              {toggleMenu ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={32}
                  height={32}
                  fill="#fff"
                  viewBox="0 0 256 256"
                >
                  <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={32}
                  height={32}
                  fill="#fff"
                  viewBox="0 0 256 256"
                >
                  <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
