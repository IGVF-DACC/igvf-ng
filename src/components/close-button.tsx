// node_modules
import { XMarkIcon } from "@heroicons/react/20/solid";
// components
import { Button } from "./form-elements";

/**
 * Displays a standard close icon button in a circle with an X mark.
 * @param {() => void} onClick Called when the button is clicked
 * @param {string} label Accessible label for the button
 */
export function CloseButton({ onClick, label }: CloseButtonProps) {
  return (
    <Button
      type="secondary"
      onClick={onClick}
      label={label}
      size="sm"
      hasIconCircleOnly
    >
      <XMarkIcon />
    </Button>
  );
}

type CloseButtonProps = {
  onClick: () => void;
  label: string;
};
