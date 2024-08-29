/**
 * Standard button types so that most buttons on the site have the same look and feel. These include
 * primary, secondary, warning, and selected buttons as well as disabled versions of each, and
 * they come in three sizes: small (sm), medium (md), and large (lg). Use selected buttons only for
 * attached buttons to show which one is selected, if that's relevant to your use case.
 *
 * This module includes regular buttons that call a function when clicked as well as buttons that
 * navigate to a new page when clicked. Use the latter sparingly as most links should appear as
 * links, not buttons.
 *
 * Both regular and link buttons support an icon-only version using the `hasIconOnly` property.
 *
 * This module also includes the <AttachedButtons> component that you can use to group buttons
 * together in a row, and appear attached to each other.
 *
 * Don't think *all* buttons on the site need to use these components. Special-use buttons can just
 * use the `<button>` element directly. But these should serve as your go-to buttons for the vast
 * majority of cases.
 */

// node_modules
import Link from "next/link";
import React, { PropsWithChildren, ReactElement } from "react";
// lib
import { LINK_INLINE_STYLE } from "@/lib/constants";

/**
 * Button types.
 */
export type ButtonType =
  | "primary" // Blue with white text; use for primary actions
  | "secondary" // Clear with blue text; use for secondary actions
  | "warning" // Red with white text; use for destructive actions
  | "selected" // Light blue with blue text; use for selected buttons in a group
  | "primaryDisabled" // Light red with white text; use for disabled primary buttons
  | "secondaryDisabled" // Clear with light blue text; use for disabled secondary buttons
  | "warningDisabled"; // Light red with white text; use for disabled warning buttons

/**
 * Button sizes.
 */
type ButtonSize = "sm" | "md" | "lg";

/**
 * Tailwind CSS classes common to all buttons; both <Button> and <ButtonLink> types.
 */
const commonButtonClasses =
  "items-center justify-center border font-semibold leading-none";

/**
 * Background colors for each of the button types.
 */
const buttonTypeClasses: Record<ButtonType, string> = {
  primary:
    "bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled",
  secondary:
    "bg-button-secondary border-button-secondary text-button-secondary fill-button-secondary disabled:bg-button-secondary-disabled disabled:border-button-secondary-disabled disabled:text-button-secondary-disabled disabled:fill-button-secondary-disabled",
  warning:
    "bg-button-warning border-button-warning text-button-warning fill-button-warning disabled:bg-button-warning-disabled disabled:border-button-warning-disabled disabled:text-button-warning-disabled disabled:fill-button-warning-disabled",
  selected:
    "bg-button-selected border-button-selected text-button-selected fill-button-selected disabled:bg-button-selected-disabled disabled:border-button-selected-disabled disabled:text-button-selected-disabled disabled:fill-button-selected-disabled",
  primaryDisabled:
    "bg-button-primary-disabled border-button-primary-disabled text-button-primary-disabled fill-button-primary-disabled",
  secondaryDisabled:
    "bg-button-secondary-disabled border-button-secondary-disabled text-button-secondary-disabled fill-button-secondary-disabled",
  warningDisabled:
    "bg-button-warning-disabled border-button-warning-disabled text-button-warning-disabled fill-button-warning-disabled",
};

/**
 * Tailwind CSS classes for each of the icon sizes.
 */
const iconSizes: Record<ButtonSize, string> = {
  sm: "[&>svg]:h-3 [&>svg]:w-3",
  md: "[&>svg]:h-4 [&>svg]:w-4",
  lg: "[&>svg]:h-5 [&>svg]:w-5",
};

/**
 * Tailwind CSS classes for each of the button sizes.
 */
const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: `px-2 rounded text-xs h-6 ${iconSizes.sm}`,
  md: `px-4 rounded text-sm h-8 ${iconSizes.md}`,
  lg: `px-6 rounded text-base h-10 ${iconSizes.lg}`,
};

/**
 * Tailwind CSS classes for each of the icon-only button sizes.
 */
const iconButtonSizeClasses: Record<ButtonSize, string> = {
  sm: `px-1.5 rounded form-element-height-sm ${iconSizes.sm}`,
  md: `px-2 rounded form-element-height-md ${iconSizes.md}`,
  lg: `px-3 rounded form-element-height-lg ${iconSizes.lg}`,
};

/**
 * Tailwind CSS classes for each of the icon-only circular button sizes.
 */
const iconCircleButtonSizeClasses: Record<ButtonSize, string> = {
  sm: `p-1 rounded-full ${iconSizes.sm}`,
  md: `p-2 rounded-full ${iconSizes.md}`,
  lg: `p-3 rounded-full ${iconSizes.lg}`,
};

/**
 * Generate the Tailwind CSS classes for the button size depending on the button size and options.
 * @param {ButtonSize} size Button size (sm, md, lg)
 * @param {boolean} hasIconOnly True for buttons containing only an icon
 * @param {boolean} hasIconCircleOnly True for circular buttons containing only an icon
 * @returns {string} Tailwind CSS classes for the button size
 */
function generateButtonSizeClasses(
  size: ButtonSize,
  hasIconOnly: boolean,
  hasIconCircleOnly: boolean
): string {
  if (hasIconOnly) {
    return iconButtonSizeClasses[size];
  }
  if (hasIconCircleOnly) {
    return iconCircleButtonSizeClasses[size];
  }
  return buttonSizeClasses[size];
}

/**
 * Generate the Tailwind CSS classes for the button to appear inline with text when requested.
 * @param {boolean} isInline True to style the button to appear inline with text
 * @returns {string} Tailwind CSS classes for the button to appear inline with text when needed
 */
function inlineClasses(isInline: boolean): string {
  return isInline ? "inline-flex" : "flex";
}

type CommonButtonProps = {
  label?: string;
  type?: ButtonType;
  size?: ButtonSize;
  hasIconOnly?: boolean;
  hasIconCircleOnly?: boolean;
  role?: string;
  isInline?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Displays a button with a site-standard style. Use this for buttons that perform an action; not
 * for buttons that navigate to a new page -- use <ButtonLink> for those. Supply any content you
 * want as the button label including text, icons, both, or a React component.
 *
 * <Button type="warning" size="lg" onClick={clickHandler}>
 *   Click me! <DecorativeIcon />
 * </Button>
 *
 * @param {function} onClick Called when the button is clicked
 * @param {string} label Accessible label of the button if the button text is not sufficient for
 *     screen readers
 * @param {string} id HTML ID of the button element
 * @param {ButtonType} type Button prefab color and style
 * @param {ButtonSize} size Button sizes
 * @param {boolean} hasIconOnly True for buttons that only contain an icon; makes the padding work
 *     better for these
 * @param {boolean} hasIconCircleOnly True for buttons that only contain an icon in a circular
 *     button
 * @param {string} role Role of the button if not "button"
 * @param {boolean} isInline True to make the button appear inline with text
 * @param {boolean} isSelected True for selected buttons; only use for attached buttons to show
 *     which one is selected
 * @param {boolean} isDisabled True to disable the button
 * @param {string} className Additional Tailwind CSS classes to apply to the <button> element
 */
export function Button({
  onClick,
  label = "",
  id = "",
  type = "primary",
  size = "md",
  hasIconOnly = false,
  hasIconCircleOnly = false,
  role = "button",
  isInline = false,
  isSelected = false,
  isDisabled = false,
  className = "",
  children,
}: ButtonProps) {
  const sizeClasses = generateButtonSizeClasses(
    size,
    hasIconOnly,
    hasIconCircleOnly
  );

  return (
    <button
      type="button"
      role={role}
      id={id}
      data-testid={id}
      onClick={onClick}
      className={`${inlineClasses(
        isInline
      )} ${commonButtonClasses} ${sizeClasses} ${
        buttonTypeClasses[type]
      } ${className}`}
      aria-label={label}
      aria-checked={isSelected}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}

export type ButtonProps = CommonButtonProps & {
  id?: string;
  onClick: () => void;
};

/**
 * Return a `Link` element for internal links, and an `a` element for external links.
 * @param {string} href URL of the link
 * @param {boolean} isExternal True for external links
 */
function LinkElement({
  href,
  isExternal,
  children,
  ...remainingProps
}: PropsWithChildren<LinkElementProps>) {
  // Make a copy of `props` but without `isExternal` in case it was included.
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...remainingProps}
      />
    );
  }
  return <Link href={href} {...remainingProps} />;
}

type LinkElementProps = {
  href: string;
  isExternal: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Displays a button that links to a URL instead of performing an action. When these
 * are "disabled" they show just the children element using the "disabled" CSS.
 *
 * <ButtonLink href="/path/to/page">
 *   Go Here!
 * </ButtonLink>
 *
 * @param {string} href Called when the button is clicked
 * @param {string} isExternal True when `href` is an external link
 * @param {string} label Accessible label of the button if the button text is not sufficient for
 *     screen readers
 * @param {string} id HTML ID of the button element
 * @param {ButtonType} type Button prefab color and style
 * @param {ButtonSize} size Button sizes
 * @param {boolean} hasIconOnly True for buttons that only contain an icon; makes the padding work
 *     better for these
 * @param {boolean} hasIconCircleOnly True for buttons that only contain an icon in a circular
 *     button
 * @param {string} role Role of the button if not "button"
 * @param {boolean} isInline True to make the button appear inline with text
 * @param {boolean} isDisabled True to disable the button
 * @param {string} className Additional Tailwind CSS classes to apply to the <button> element
 */
export function ButtonLink({
  href,
  isExternal = false,
  label = "",
  type = "primary",
  size = "md",
  hasIconOnly = false,
  hasIconCircleOnly = false,
  isInline = false,
  isDisabled = false,
  className = "",
  children,
}: ButtonLinkProps) {
  const sizeClasses = generateButtonSizeClasses(
    size,
    hasIconOnly,
    hasIconCircleOnly
  );

  const disabledType = `${type}Disabled` as ButtonType;

  return isDisabled ? (
    <div
      aria-label={label}
      className={`text-center no-underline ${inlineClasses(
        isInline
      )} ${commonButtonClasses} ${sizeClasses} ${
        buttonTypeClasses[disabledType]
      } ${className}`}
    >
      {children}
    </div>
  ) : (
    <LinkElement
      href={href}
      isExternal={isExternal}
      aria-label={label}
      className={`text-center no-underline ${inlineClasses(
        isInline
      )} ${commonButtonClasses} ${sizeClasses} ${
        buttonTypeClasses[type]
      } ${className}`}
    >
      {children}
    </LinkElement>
  );
}

export type ButtonLinkProps = CommonButtonProps & {
  href: string;
  isExternal?: boolean;
};

/**
 * Wrapper for buttons that appear attached to each other on one line. We usually use this for
 * buttons that let the user choose between options, sort of like tabs but in places where tabs
 * don't make sense. Simply wrap <Button> or <ButtonLink> components in this component. Make sure
 * none of the buttons has content to make one button taller than the others or you'll see an
 * awkward height difference.
 *
 * Be careful with mobile. We don't yet support good degradation of this component if the space it
 * exists in is too narrow. For now, make sure these buttons can appear side by side even on
 * mobile. Once Firefox supports container queries, we can use those to make this component degrade
 * gracefully.
 *
 * See https://github.com/tailwindlabs/tailwindcss-container-queries for a Tailwind CSS plugin that
 * adds container queries to Tailwind CSS.
 */
export function AttachedButtons({
  testid = "",
  className = "",
  children,
}: PropsWithChildren<AttachedButtonsProps>) {
  // Modify the borders and corner roundness of the child buttons so they look attached to each
  // other.
  const moddedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as ReactElement<{ className?: string }>, {
        className: `${
          (child.props as any).className || ""
        } border-r-0 last:border-r rounded-none first:rounded-l last:rounded-r`,
      });
    }
    return child;
  });

  return (
    <div data-testid={testid} className={`flex ${className}`}>
      {moddedChildren}
    </div>
  );
}

type AttachedButtonsProps = {
  testid?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Renders a button that appears like a link. Best used for buttons that appear inline with text.
 * Use sparingly as most links should appear as links, not buttons.
 * @param {function} onClick Called when the button is clicked
 */
export function ButtonAsLink({ onClick, children }: ButtonAsLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline underline ${LINK_INLINE_STYLE}`}
    >
      {children}
    </button>
  );
}

type ButtonAsLinkProps = {
  onClick: () => void;
  children: React.ReactNode;
};
