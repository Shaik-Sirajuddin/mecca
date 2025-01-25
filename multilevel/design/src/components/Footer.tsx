import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-purple1 overflow-hidden">
      <div className="w-full max-w-[1152px] mx-auto px-4 relative">
        <div className="w-full flex md:flex-row flex-col md:gap-0 gap-8">
          <div className=" flex md:flex-row flex-col gap-8 xl:gap-24 md:gap-6 md:border-r md:border-black3 xl:pr-[86px] md:pr-5 xl:pt-[80px] pt-10 md:pt-9 mb:pb-6 xl:pb-10">
            <Link to="/">
              <img
                src="Mecca-Logo.png"
                alt="Logo"
                className="lg:min-w-[107.63px] min-w-24 object-contain"
              />
            </Link>

            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/" className="text-sm  lg:whitespace-nowrap font-bold font-dm-sans uppercase text-gray1 transition-all duration-200 hover:text-gray2">Home</Link>
              </li>
              <li>
                <Link to="/how" className="text-sm lg:whitespace-nowrap font-bold font-dm-sans uppercase text-gray1 transition-all duration-200 hover:text-gray2">HOW</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm lg:whitespace-nowrap font-bold font-dm-sans uppercase text-gray1 transition-all duration-200 hover:text-gray2">DASHBOARD</Link>
              </li>
              <li>
                <Link to="/crew" className="text-sm lg:whitespace-nowrap font-bold font-dm-sans uppercase text-gray1 transition-all duration-200 hover:text-gray2">MY CREW</Link>
              </li>
              <li>
                <Link to="/organization-chart" className="text-sm lg:whitespace-nowrap font-bold font-dm-sans uppercase text-gray1 transition-all duration-200 hover:text-gray2">ORGANISATION CHART</Link>
              </li>
            </ul>
          </div>

          <div className="md:w-1/3 flex flex-col md:border-r md:border-black3 md:px-5 xl:px-[86px] md:pt-9 xl:pt-[80px] md:pb-6 xl:pb-10">
            <h3 className="text-gray2 text-xs mb-10 uppercase font-bold tracking-widest">contact</h3>
            <p className="text-sm text-gray1 font-normal mb-3">43252 Borer Mountains</p>
            <p className="text-sm text-gray1 font-normal mb-3">Zackerychester</p>
            <p className="text-sm text-gray1 font-normal mb-3">Bahamas</p>
            <p className="text-sm text-gray1 font-normal mb-3">732-528-4945</p>

          </div>

          <div className="md:w-1/3 sm:w-1/2 sm:max-w-full max-w-[256px] flex flex-col xl:pl-[86px] md:pl-5 xl:pt-[80px] md:pt-9 md:pb-8 xl:pb-[66px]">
          <h3 className="text-gray2 text-xs mb-10 uppercase font-bold tracking-widest">newsletter</h3>
          <p className="text-gray2 text-sm leading-6 sm:pr-10">Subscribe our newsletter to get more free design course and resource</p>
          <form id="news-letter-form" className="relative inline-flex items-center justify-end mt-5" >
            <input
              type="email"
              id="email"
              name="email"
              className="border-black3 bg-transparent text-white text-sm rounded-full border-2 py-3 px-4 w-full focus:outline-none focus:border-gray2 placeholder:text-gray1"
              placeholder="Your email address"
            />
            <button type="submit" className="bg-magenta1 absolute right-2 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full"><svg
            width={14}
            height={9}
            viewBox="0 0 14 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.09094 0.265207C9.49676 -0.109399 10.1294 -0.0840962 10.504 0.321722L13.7348 3.82168C14.0884 4.20474 14.0884 4.79518 13.7348 5.17824L10.504 8.67828C10.1294 9.08411 9.49677 9.10941 9.09095 8.73481C8.68513 8.36021 8.65982 7.72755 9.03442 7.32173L10.716 5.49997L0.999999 5.49997C0.447714 5.49997 -7.64154e-07 5.05225 -7.86799e-07 4.49997C-8.09444e-07 3.94768 0.447714 3.49997 0.999999 3.49997L10.716 3.49997L9.03443 1.67829C8.65982 1.27247 8.68513 0.639813 9.09094 0.265207Z"
              fill="#FCFCFD"
            />
          </svg>
          </button>
          </form>
          </div>

        </div>
        <div className="w-full flex sm:flex-row flex-col items-start justify-between gap-3 sm:gap-8 sm:items-center py-6 relative md:mt-0 mt-[40px]">
        <hr className="md:border-t md:border-black3 border-transparent absolute top-0 w-screen left-1/2 -translate-x-1/2" />
          <p className="text-xs text-gray1 font-poppins pr-12">Copyright © 2021 UI8 LLC. All rights reserved</p>
          <ul className="flex items-center gap-6">
            <li>
              <Link to="#" className="inline-flex items-center justify-center transition-all duration-200 hover:scale-125">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.99999 16.6666C13.6819 16.6666 16.6667 13.6819 16.6667 9.99996C16.6667 6.31806 13.6819 3.33329 9.99999 3.33329C6.31809 3.33329 3.33332 6.31806 3.33332 9.99996C3.33332 13.6819 6.31809 16.6666 9.99999 16.6666ZM9.99999 18.3333C14.6023 18.3333 18.3333 14.6023 18.3333 9.99996C18.3333 5.39758 14.6023 1.66663 9.99999 1.66663C5.39761 1.66663 1.66666 5.39758 1.66666 9.99996C1.66666 14.6023 5.39761 18.3333 9.99999 18.3333Z"
                    fill="#777E91"
                  />
                  <path
                    d="M9.99999 8.33337C9.99999 7.87314 10.3731 7.50004 10.8333 7.50004H11.6667C12.1269 7.50004 12.5 7.12695 12.5 6.66671C12.5 6.20647 12.1269 5.83337 11.6667 5.83337H10.8333C9.45257 5.83337 8.33332 6.95267 8.33332 8.33337V10H7.49999C7.03976 10 6.66666 10.3731 6.66666 10.8334C6.66666 11.2936 7.03975 11.6667 7.49999 11.6667H8.33332V16.6667C8.33332 17.127 8.70641 17.5 9.16666 17.5C9.62691 17.5 9.99999 17.127 9.99999 16.6667V11.6667H11.6667C12.1269 11.6667 12.5 11.2936 12.5 10.8334C12.5 10.3731 12.1269 10 11.6667 10H9.99999V8.33337Z"
                    fill="#777E91"
                  />
                </svg>
              </Link>
            </li>
            <li>
              <Link to="#" className="inline-flex items-center justify-center transition-all duration-200 hover:scale-125">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.65064 11.6665C1.27254 11.6704 0.382938 13.2403 1.23194 14.4298C2.44779 16.133 4.65258 17.5 8.33343 17.5C14.0377 17.5 18.6165 12.8514 17.9755 7.35925L18.9146 5.48108C19.5658 4.17857 18.4342 2.69685 17.0062 2.98245L15.7655 3.23057C15.4366 3.05702 15.0962 2.92606 14.8053 2.83117C14.2383 2.64627 13.552 2.5 12.9168 2.5C11.7757 2.5 10.7908 2.79276 10.0082 3.37994C9.23443 3.96053 8.79859 4.72354 8.55943 5.42421C8.44918 5.74717 8.37576 6.07112 8.32865 6.38203C7.88593 6.24269 7.4345 6.05522 6.99255 5.82629C5.98989 5.30693 5.17909 4.64852 4.72172 4.07126C3.95436 3.10275 2.32816 3.17456 1.75751 4.43351C0.953227 6.20789 1.17385 8.31122 1.8968 10.0108C2.13912 10.5803 2.45433 11.1434 2.83942 11.6652C2.77349 11.666 2.71043 11.6663 2.65064 11.6665ZM8.33334 15.8333C5.11389 15.8333 3.44917 14.6672 2.58838 13.4614C2.5497 13.4072 2.5887 13.3333 2.65526 13.3332C3.53096 13.3307 5.32846 13.2892 6.51396 12.5954C6.57527 12.5595 6.56178 12.4691 6.49444 12.4465C3.73097 11.5173 2.16011 7.58216 3.27543 5.12158C3.301 5.06517 3.37684 5.05772 3.41531 5.10628C4.68937 6.71432 7.47504 8.28933 9.89868 8.33242C9.95126 8.33333 9.99101 8.28558 9.98301 8.23361C9.88534 7.60044 9.51243 4.16667 12.9167 4.16667C13.7296 4.16667 14.9391 4.56319 15.3846 4.96942C15.4052 4.98819 15.4331 4.99672 15.4604 4.99125L17.3329 4.61675C17.4009 4.60315 17.4548 4.67371 17.4238 4.73573L16.2624 7.05849C16.2543 7.07462 16.2518 7.09312 16.2549 7.11088C17.0683 11.6833 13.3233 15.8333 8.33334 15.8333Z"
                    fill="#777E91"
                  />
                </svg>
              </Link>
            </li>
            <li>
              <Link to="#" className="inline-flex items-center justify-center transition-all duration-200 hover:scale-125">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.3333 3.33329H6.66666C4.82571 3.33329 3.33332 4.82568 3.33332 6.66663V13.3333C3.33332 15.1742 4.82571 16.6666 6.66666 16.6666H13.3333C15.1742 16.6666 16.6667 15.1742 16.6667 13.3333V6.66663C16.6667 4.82568 15.1742 3.33329 13.3333 3.33329ZM6.66666 1.66663C3.90523 1.66663 1.66666 3.9052 1.66666 6.66663V13.3333C1.66666 16.0947 3.90523 18.3333 6.66666 18.3333H13.3333C16.0947 18.3333 18.3333 16.0947 18.3333 13.3333V6.66663C18.3333 3.9052 16.0947 1.66663 13.3333 1.66663H6.66666Z"
                    fill="#777E91"
                  />
                  <path
                    d="M14.1667 6.66667C14.6269 6.66667 15 6.29357 15 5.83333C15 5.3731 14.6269 5 14.1667 5C13.7064 5 13.3333 5.3731 13.3333 5.83333C13.3333 6.29357 13.7064 6.66667 14.1667 6.66667Z"
                    fill="#777E91"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.1667 10C14.1667 12.3012 12.3012 14.1667 10 14.1667C7.69883 14.1667 5.83334 12.3012 5.83334 10C5.83334 7.69886 7.69883 5.83337 10 5.83337C12.3012 5.83337 14.1667 7.69886 14.1667 10ZM12.5 10C12.5 11.3808 11.3808 12.5 10 12.5C8.61926 12.5 7.50001 11.3808 7.50001 10C7.50001 8.61929 8.61926 7.50004 10 7.50004C11.3808 7.50004 12.5 8.61929 12.5 10Z"
                    fill="#777E91"
                  />
                </svg>
              </Link>
            </li>
          </ul>
        </div>

        <a href="#" className="w-10 h-10 flex items-center absolute md:right-0 right-5 bottom-11 md:bottom-20 justify-center bg-magenta1 rounded">
        <svg
            width={20}
            height={20}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <mask
              id="mask0_369_141"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={20}
              height={20}
            >
              <rect width={20} height={20} fill="url(#pattern0_369_141)" />
            </mask>
            <g mask="url(#mask0_369_141)">
              <rect width={20} height={20} fill="#FCFCFD" />
            </g>
            <defs>
              <pattern
                id="pattern0_369_141"
                patternContentUnits="objectBoundingBox"
                width={1}
                height={1}
              >
                <use xlinkHref="#image0_369_141" transform="scale(0.00195312)" />
              </pattern>
              <image
                id="image0_369_141"
                width={512}
                height={512}
                xlinkHref="data:image/png;base64,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"
              />
            </defs>
          </svg>

        </a>
      </div>
    </footer>
  );
};
