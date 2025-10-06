import type { VariantProps } from 'tailwind-variants';

import { tv } from 'tailwind-variants';

export const selectTriggerVariants = tv({
  base: 'select__trigger',
  defaultVariants: {
    isIconOnly: false,
    size: 'md',
    variant: 'secondary',
  },
  variants: {
    isIconOnly: {
      true: 'select__trigger--icon-only',
    },
    size: {
      lg: 'select__trigger--lg',
      md: 'select__trigger--md',
      sm: 'select__trigger--sm',
    },
    variant: {
      danger: 'select__trigger--danger',
      ghost: 'select__trigger--ghost',
      primary: 'select__trigger--primary',
      secondary: 'select__trigger--secondary',
      tertiary: 'select__trigger--tertiary',
    },
  },
});

export const selectContentVariants = tv({
  base: 'select__content',
});

export const selectListVariants = tv({
  base: 'select__list',
});

export const selectItemVariants = tv({
  base: 'select__item',
  defaultVariants: {
    isIconOnly: false,
    size: 'md',
    variant: 'secondary',
  },
  variants: {
    isIconOnly: {
      true: 'select__item--icon-only',
    },
    size: {
      lg: 'select__item--lg',
      md: 'select__item--md',
      sm: 'select__item--sm',
    },
    variant: {
      danger: 'select__item--danger',
      ghost: 'select__item--ghost',
      primary: 'select__item--primary',
      secondary: 'select__item--secondary',
      tertiary: 'select__item--tertiary',
    },
  },
});

export type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>;
export type SelectContentVariants = VariantProps<typeof selectContentVariants>;
export type SelectListVariants = VariantProps<typeof selectListVariants>;
export type SelectItemVariants = VariantProps<typeof selectItemVariants>;
