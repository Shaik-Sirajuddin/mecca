import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ModelWarning2({ setIsOpen, isOpen }: Props) {
  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3">
            <DialogPanel
              transition
              className="w-full max-w-[448px] rounded-xl bg-[url(model-bg-1.png)] bg-full-3 bg-center bg-no-repeat duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <div className="w-full max-w-[310px] py-11 mx-auto">
                <DialogTitle
                  as="h3"
                  className="text-2xl font-medium text-center text-yellow1"
                >
                  Invitation Address Failed
                </DialogTitle>
                <p className="mt-6 text-base text-center text-gray5">
                  Enter valid Invitation address or login through the Invite
                  code
                </p>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
