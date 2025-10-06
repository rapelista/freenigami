import * as React from 'react';
import {
  ListBoxItem as SelectItemPrimitive,
  type ListBoxItemProps as SelectItemPrimitiveProps,
  ListBox as SelectListPrimitive,
  type ListBoxProps as SelectListPrimitiveProps,
  Popover as SelectPopoverPrimitive,
  type PopoverProps as SelectPopoverPrimitiveProps,
  Select as SelectRootPrimitive,
  type SelectProps as SelectRootPrimitiveProps,
  Button as SelectTriggerPrimitive,
  type ButtonProps as SelectTriggerPrimitiveProps,
} from 'react-aria-components';

import {
  selectContentVariants,
  selectItemVariants,
  type SelectItemVariants,
  selectListVariants,
  type SelectListVariants,
  selectTriggerVariants,
  type SelectTriggerVariants,
} from './select.style';

interface SelectRootProps extends SelectRootPrimitiveProps {}

const SelectRoot = React.forwardRef<HTMLDivElement, SelectRootProps>(
  (props, ref) => {
    return <SelectRootPrimitive {...props} ref={ref} />;
  },
);

SelectRoot.displayName = 'SelectRoot';

interface SelectTriggerProps
  extends SelectTriggerPrimitiveProps,
    SelectTriggerVariants {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ isIconOnly, size, variant, className, ...props }, ref) => {
    const styles = selectTriggerVariants({
      isIconOnly,
      size,
      variant,
      class: typeof className === 'string' ? className : undefined,
    });

    return <SelectTriggerPrimitive {...props} ref={ref} className={styles} />;
  },
);

SelectTrigger.displayName = 'SelectTrigger';

interface SelectContentProps extends SelectPopoverPrimitiveProps {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, ...props }, ref) => {
    const styles = selectContentVariants({
      class: typeof className === 'string' ? className : undefined,
    });

    return <SelectPopoverPrimitive {...props} ref={ref} className={styles} />;
  },
);

SelectContent.displayName = 'SelectContent';

interface SelectListProps
  extends SelectListPrimitiveProps<object>,
    SelectListVariants {}

const SelectList = React.forwardRef<HTMLDivElement, SelectListProps>(
  ({ className, ...props }, ref) => {
    const styles = selectListVariants({
      class: typeof className === 'string' ? className : undefined,
    });

    return <SelectListPrimitive {...props} ref={ref} className={styles} />;
  },
);

SelectList.displayName = 'SelectList';

interface SelectItemProps
  extends SelectItemPrimitiveProps,
    SelectItemVariants {}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ isIconOnly, variant, size, className, ...props }, ref) => {
    const styles = selectItemVariants({
      isIconOnly,
      variant,
      size,
      class: typeof className === 'string' ? className : undefined,
    });

    return <SelectItemPrimitive {...props} ref={ref} className={styles} />;
  },
);

SelectItem.displayName = 'SelectItem';

const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  List: SelectList,
  Item: SelectItem,
});

export default Select;
