/**
 * Import the <Modal> component to have modal dialogs appear. The general method looks like this:
 *
 * <Modal isOpen={isOpenState} onClose={() => { setOpenState(false) }}>
 *  <Modal.Header>
 *   <h2>My Modal</h2>
 *  </Modal.Header>
 *  <Modal.Body>
 *   <p>This is the body of my modal.</p>
 *  </Modal.Body>
 *  <Modal.Footer>
 *   <button>Close</button>
 *  </Modal.Footer>
 * </Modal>
 *
 * You can skip any of the child <Modal> components. Each can accept either primitives or JSX as
 * child elements. The Modal component itself handles closing the modal when the user clicks the
 * backdrop or types the ESC key.
 */

// node_modules
import { Dialog } from "@headlessui/react";
import { Children } from "react";
// components
import { CloseButton } from "./close-button";

/**
 * Main component for modal dialogs.
 * @param {boolean} isOpen True if the modal is open
 * @param {() => void} onClose Called to close the modal on click outside or ESC
 * @param {string} testid Data-testid attribute for testing
 */
export function Modal({ isOpen, onClose, testid = "", children }: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50 text-black dark:text-white"
      data-testid={testid}
    >
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60"
        aria-hidden="true"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <Dialog.Panel className="mx-auto my-5 w-4/5 max-w-4xl overflow-hidden rounded-xl border border-modal-border bg-white drop-shadow-lg xl:my-20 dark:bg-gray-900">
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  testid?: string;
  children: React.ReactNode;
};

/**
 * Displays the header, typically containing a title and an optional close button on the right side
 * if provided. If you supply a string or number as the only child of <Modal.Header>, it gets
 * wrapped in an <h2> tag. If you instead supply JSX elements or React components, they get
 * rendered as is, though within a flex container so that the optional close box still gets
 * rendered.
 * @param {() => void} onClose Called when the close button is clicked
 * @param {string} closeLabel Accessible label for the close button
 * @param {string} className Tailwind CSS classes to add to the header
 */
function Header({
  onClose = null,
  closeLabel = "Close dialog",
  className = "",
  children,
}: HeaderProps) {
  // If the children is a single string or number, wrap it in an <h2>. Otherwise the children
  // comprise one or more JSX elements, in which case we just render them within the header <div>
  // as is.
  let headerChildren = children;
  if (Children.count(children) === 1) {
    const childrenArray = Children.toArray(children);
    const firstChildType = typeof childrenArray[0];
    if (firstChildType === "string") {
      // `children` comprises a single string or number, so wrap it in an <h2>.
      headerChildren = <h2 className="text-lg font-semibold">{children}</h2>;
    }
  }

  return (
    <div
      className={`flex items-center justify-between border-b border-modal-border p-2 ${className}`}
    >
      {headerChildren}
      {onClose ? <CloseButton label={closeLabel} onClick={onClose} /> : null}
    </div>
  );
}

type HeaderProps = {
  onClose?: (() => void) | null;
  closeLabel?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wraps the contents of a modal to provide a standard padding. You can skip using this if you
 * don't want padding, or non-standard padding.
 * @param {string} className Tailwind CSS classes to add to the body wrapper div
 */
function Body({ className = "", children }: BodyProps) {
  return (
    <div className={className}>
      <div className="p-2">{children}</div>
    </div>
  );
}

type BodyProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Footer for the modal. This is typically used to provide an action button, or a close button.
 */
function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-1 border-t border-modal-border bg-gray-50 p-1.5 dark:bg-gray-800">
      {children}
    </div>
  );
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
