/**
 * This module displays form elements with a site-wide standard styling.
 */

// components
import { FormLabel } from "@/components/form-elements";
// lib
import { UC } from "@/lib/constants";

const sizeClasses = {
  sm: "text-xs px-1 form-element-height-sm",
  md: "text-sm px-1.5 form-element-height-md",
  lg: "text-lg px-2 form-element-height-lg",
} as const;
type Size = keyof typeof sizeClasses;

const labelSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

const enum TextFieldType {
  Text = "text",
  Search = "search",
  Email = "email",
  Number = "number",
}

type TextFieldProps = {
  label?: string;
  fieldLabel?: string;
  name: string;
  value: string;
  type?: TextFieldType;
  message?: string;
  size?: Size;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isSpellCheckDisabled?: boolean;
  isMessageAllowed?: boolean;
  placeholder?: string;
};

/**
 * Displays an input text field. This uses the React controlled-input method, so the current
 * edited value gets passed in the `value` property.
 * @param {string} [label] Label to display above the text field
 * @param {string} [fieldLabel] aria-label for the input text field
 * @param {string} name Name of the text field
 * @param {string} [value] Value of the text field
 * @param {TextFieldType} [type] Type of the text field
 * @param {string} [message] Message to display below the field
 * @param {Size} [size] Size of the text field
 * @param {React.ChangeEventHandler<HTMLInputElement>} onChange Called when the text field value
 *     changes
 * @param {React.FocusEventHandler<HTMLInputElement>} [onBlur] Called when the text field loses
 *     focus
 * @param {React.FocusEventHandler<HTMLInputElement>} [onFocus] Called when the text field gains
 *     focus
 * @param {string} [className] Tailwind CSS classes
 * @param {boolean} [isRequired] True if the text field is required
 * @param {boolean} [isDisabled] True if the text field is disabled
 * @param {boolean} [isSpellCheckDisabled] True if the text field should have spell checking disabled
 * @param {boolean} [isMessageAllowed] True to allow space for a message below the field
 * @param {string} [placeholder] Placeholder text to display in the text field
 */
export function TextField({
  label = "",
  fieldLabel = "",
  name,
  value,
  type = TextFieldType.Text,
  message = "",
  size = "md",
  onChange,
  onBlur,
  onFocus,
  className = "",
  isRequired = false,
  isDisabled = false,
  isSpellCheckDisabled = false,
  isMessageAllowed = true,
  placeholder = "",
}: TextFieldProps) {
  return (
    <div data-testid="form-text-field" className={className}>
      {label && (
        <FormLabel
          htmlFor={name}
          className={labelSizeClasses[size]}
          isRequired={isRequired}
        >
          {label}
        </FormLabel>
      )}
      <input
        className={`block w-full rounded border border-form-element bg-form-element text-form-element disabled:border-form-element-disabled disabled:text-form-element-disabled ${sizeClasses[size]}`}
        aria-label={fieldLabel || label}
        name={name}
        id={name}
        value={value}
        placeholder={placeholder}
        type={type}
        spellCheck={isSpellCheckDisabled ? "false" : "true"}
        disabled={isDisabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {isMessageAllowed && (
        <div className="mt-1 text-xs font-bold uppercase text-red-500">
          {message || UC.nbsp}
        </div>
      )}
    </div>
  );
}
