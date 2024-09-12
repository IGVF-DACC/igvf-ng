/**
 * This module lets you have a list of options that the user can select from. It supports both
 * single selections as well as multiple selections. The client keeps track of the selected item or
 * items in React state, and <ListSelect> updates the state when the user clicks on an item.
 *
 * The client determines the content of each item in the list, using the <ListSelect.Option>
 * component to wrap each item in the list.
 *
 * You can specify the height of the <ListSelect> using a Tailwind CSS class in the `className`
 * property. If this height doesn't give enough room for all the items, the list scrolls.
 *
 * Here's what a component with a <ListSelect> supporting multiple selections could look like.
 * `items` holds an array of data you want to include in the list. Each item in the array normally
 * has a string or numeric ID, as well as the value to display.
 *
 *   const [currentSelections, setCurrentSelections] = useState([]);
 *
 *   <ListSelect
 *     value={currentSelections}
 *     onChange={setCurrentSelections}
 *     multiple
 *     className="h-20"
 *   >
 *     {items.map((item) => {
 *       return (
 *         <ListSelect.Option key={item.id} id={item.id}>
 *           {item.label}
 *         </ListSelect.Option>
 *       );
 *     })}
 *   </ListSelect>
 *
 * With each click, the `currentSelections` state array gets updated with a list of the IDs of the
 * selected items. If you need to perform an action on each click, you can use a `useEffect` hook
 * to detect changes to the state array, or pass a click handler to the onChange property to
 * perform the action in addition to updating the state array. The click handler should expect the
 * updated array of selected items as the function's argument.
 *
 * Here's what a component with a <ListSelect> supporting single selections could look like.
 *
 *   const [currentSelection, setCurrentSelection] = useState("");
 *
 *   <ListSelect value={currentSelection} onChange={setCurrentSelection}>
 *     {items.map((item) => {
 *       return (
 *         <ListSelect.Option key={item.id} id={item.id}>
 *           {item.label}
 *         </ListSelect.Option>
 *       );
 *     })}
 *   </ListSelect>
 *
 * With each click, the `currentSelection` state gets updated with the ID of the selected item.
 *
 * You can include a text field at the top of the list that filters the list items. To do this, set
 * the `filter` property to the value of the filter text field, and set the `onFilterChange`
 * property to a function that updates the filter text field. The list will update to show only the
 * items that match the filter text. The actual filtering of items must happen in the client code,
 * as does the storage of the filter text value.
 */

// node_modules
import { CheckIcon } from "@heroicons/react/20/solid";
import { Children, cloneElement, isValidElement, ReactElement } from "react";
// components
import { FormLabel, TextField } from "@/components/form-elements";

type ListSelectProps = {
  label?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  isMultiple?: boolean;
  className?: string;
  scrollId?: string;
  isBorderHidden?: boolean;
  filter?: string;
  onFilterChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
};

type ChildProps = {
  onClick: (itemId: string) => void;
  selected: boolean;
  isMultiple: boolean;
  parentLabel: string;
  id: string;
};

/**
 * This is the parent component that wraps the list of options.
 * @param {string} label Label to display above the list
 * @param {string,number} value ID of selected item, or array of IDs of selected items if `isMultiple`
 * @param {function} onChange Function to call when the selected element(s) changed
 * @param {boolean} [isMultiple] True to allow multiple item selections
 * @param {string} [className] Tailwind CSS classes to apply to the wrapper element
 * @param {string} [scrollId] ID of the scrolling div
 * @param {boolean} [isBorderHidden] True to hide the border around the list
 * @param {string} [filter] Filter text value
 * @param {function} [onFilterChange] Function to call when the filter text changes
 */
export function ListSelect({
  label = "",
  value,
  onChange,
  isMultiple = false,
  className = "",
  scrollId = "",
  isBorderHidden = false,
  filter = "",
  onFilterChange,
  children,
}: ListSelectProps) {
  /**
   * Called when the user clicks a list item to select or deselect it. This handles both single and
   * multiple selections.
   * @param {string,number} itemId Client's id for the clicked item
   */
  function onClickItem(itemId: string) {
    if (isMultiple) {
      // Add or remove the item from the list of selected items.
      const newValue = [...value];
      if (newValue.includes(itemId)) {
        newValue.splice(newValue.indexOf(itemId), 1);
      } else {
        newValue.push(itemId);
      }
      onChange(newValue);
    } else {
      // Single selection, so set the value to the clicked item id. If the user clicked the
      // currently selected item, leave no item selected.
      onChange(itemId === value ? "" : itemId);
    }
  }

  // Add the click handler and other list-select options to each of the ListSelect.Option children.
  const clonedChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child as ReactElement<ChildProps>, {
        onClick: onClickItem,
        selected: isMultiple
          ? value.includes(child.props.id)
          : value === child.props.id,
        isMultiple,
        parentLabel: label,
      });
    }

    // Not React component, so don't add props to the child.
    return child;
  });

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        {label && <FormLabel>{label}</FormLabel>}
        {onFilterChange && (
          <TextField
            name={`filter-${label}`}
            value={filter}
            onChange={onFilterChange}
            size="sm"
            isMessageAllowed={false}
            placeholder="filter"
            className="w-full max-w-72"
          />
        )}
      </div>
      <div
        className={`flex rounded bg-panel ${
          isBorderHidden ? "" : "border border-panel"
        }`}
      >
        <div id={scrollId} className="w-full overflow-y-scroll p-2">
          {clonedChildren}
        </div>
      </div>
    </div>
  );
}

type OptionProps = {
  id: string;
  label: string;
  selected?: boolean;
  isMultiple?: boolean;
  onClick?: (itemId: string) => void;
  parentLabel?: string;
  children: React.ReactNode;
};

/**
 * Wraps a single item within a <ListSelect>. This reacts to item clicks by calling the client's
 * `onClick` function.
 * @param {string} id ID of this option
 * @param {string} label Label to display for this option
 * @param {boolean} [selected] True if this item is selected
 * @param {boolean} [isMultiple] True if the <ListSelect> is in multiple selection mode
 * @param {function} onClick Function to call when this item is clicked
 * @param {string} parentLabel Label of the parent <ListSelect>
 */
function Option({
  id,
  label,
  selected,
  isMultiple,
  onClick,
  parentLabel,
  children,
}: OptionProps) {
  const selectedButtonStyle = selected ? "bg-slate-200 dark:bg-slate-800" : "";
  const roundedCheckStyle = isMultiple ? "rounded-sm" : "rounded-full";
  const selectedCheckStyle = selected
    ? "bg-slate-500"
    : "border border-form-element";

  return (
    <button
      id={id}
      onClick={() => onClick?.(id)}
      className={`my-0.5 flex w-full items-center rounded p-1 px-2 ${selectedButtonStyle}`}
      aria-label={`${parentLabel ? `${parentLabel} ` : ""}${label}${
        selected ? " selected" : ""
      } list item`}
    >
      <div
        className={`mr-2 h-4 w-4 shrink-0 grow-0 basis-4 p-px ${roundedCheckStyle} ${selectedCheckStyle}`}
      >
        {selected && <CheckIcon className="fill-white" />}
      </div>
      {children}
    </button>
  );
}

type MessageProps = {
  id?: string;
  children: React.ReactNode;
};

/**
 * Displays a message within a <ListSelect>. Use this to display a non-selectable message within
 * the list of options. You could use this to display a message when the list has no selectable
 * options, for example.
 * @param {string} [id] ID of this message
 */
function Message({ id = "", children }: MessageProps) {
  return (
    <div id={id} className="w-full">
      {children}
    </div>
  );
}

ListSelect.Message = Message;
ListSelect.Option = Option;
