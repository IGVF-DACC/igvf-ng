// components
import { Icon } from "@/components/icon";

type FormLabelProps = {
  htmlFor?: string;
  isRequired?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Displays the label for a form element.
 * @param {string} [htmlFor] The id of the form element this label is for
 * @param {boolean} [isRequired] True if the label is required
 * @param {string} [className] Additional Tailwind CSS classes to apply to the <div> element
 */
export function FormLabel({
  htmlFor = "",
  isRequired = false,
  className = "",
  children,
}: FormLabelProps) {
  return (
    <label
      data-testid="form-label"
      htmlFor={htmlFor}
      className={`${className} flex items-center font-semibold text-data-label`}
    >
      {children}
      {isRequired && <Icon.Splat className="ml-1 h-2.5 w-2.5 fill-red-500" />}
    </label>
  );
}
