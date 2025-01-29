import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface Props {
  title: string;
  description: string;
  show: boolean;
  onClose: () => void;
}

export default function ModelFailure({
  title,
  description,
  onClose,
  show,
}: Props) {
  function close() {
    onClose();
  }

  return (
    <>
      <Dialog
        open={show}
        as="div"
        className="relative z-50 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto blurred-background">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              style={{
                background: "#222226",
              }}
              className="w-full max-w-[448px] rounded-xl bg-[url(model-bg-1.png)] bg-full-3 bg-center bg-no-repeat duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <div className="w-full max-w-[310px] py-11 mx-auto">
                <DialogTitle
                  as="h3"
                  className="text-2xl font-medium text-center text-red1"
                >
                  {title}
                </DialogTitle>
                <p className="mt-6 text-base text-center text-gray5">
                  {description}
                </p>
                <div className="mt-6 flex items-center justify-center gap-3 text-center">
                  {/* <Button
                    className="inline-flex items-center gap-2 outline-none rounded-md hover:bg-black1 bg-transparent py-3 px-6 text-base font-semibold text-gray1 focus:outline-none"
                    onClick={close}
                  >
                    Cancel
                  </Button> */}
                  <Button
                    className="inline-flex relative justify-center items-center gap-2  text-base font-semibold text-white  focus:outline-none"
                    onClick={close}
                  >
                    <svg
                      width={79}
                      height={48}
                      viewBox="0 0 79 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 8.30002C0 7.98063 0.0764941 7.66587 0.223082 7.38211L3.47752 1.08209C3.82084 0.417465 4.50637 0 5.25443 0H77C78.1046 0 79 0.895431 79 2V40.2253C79 40.5656 78.9132 40.9003 78.7477 41.1976L75.5352 46.9723C75.1823 47.6067 74.5134 48 73.7875 48H2C0.895429 48 0 47.1046 0 46V8.30002Z"
                        fill="#D107FB"
                      />
                    </svg>
                    <span className="absolute">OK</span>
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
