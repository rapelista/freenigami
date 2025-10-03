'use client';

import { Button } from '@heroui/react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useMemo } from 'react';

import { range } from '~/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  siblings?: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination Component
 *
 * A fully accessible and responsive pagination component with support for:
 * - First, Previous, Next, Last navigation
 * - Current page and total pages display
 * - Sibling pages configuration
 * - ARIA attributes for accessibility
 *
 * @param currentPage - Current active page (1-indexed)
 * @param totalPages - Total number of pages
 * @param siblings - Number of sibling pages to show on each side (default: 1)
 * @param onPageChange - Callback function when page changes
 */
export function Pagination({
  currentPage,
  totalPages,
  siblings = 1,
  onPageChange,
}: PaginationProps) {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblings * 2 + 5; // siblings + current + first + last + 2 dots

    // Case 1: If total pages is less than the page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but right dots to be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblings;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, 'dots', totalPages];
    }

    // Case 3: No right dots to show, but left dots to be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblings;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);

      return [firstPageIndex, 'dots', ...rightRange];
    }

    // Case 4: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);

      return [firstPageIndex, 'dots', ...middleRange, 'dots', lastPageIndex];
    }

    return [];
  }, [currentPage, totalPages, siblings]);

  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex items-center justify-center gap-1 sm:gap-2 [&>button]:w-9 [&>button]:h-9"
      role="navigation"
    >
      {/* First Page Button */}
      <Button
        isIconOnly
        aria-label="Go to first page"
        className="hidden sm:flex"
        isDisabled={isFirstPage}
        size="sm"
        variant="ghost"
        onPress={() => onPageChange(1)}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous Page Button */}
      <Button
        isIconOnly
        aria-label="Go to previous page"
        isDisabled={isFirstPage}
        size="sm"
        variant="ghost"
        onPress={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft />
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 [&>button]:w-9 [&>button]:h-9">
        {paginationRange.map((pageNumber, index) => {
          // If the page item is a DOT, render dots
          if (pageNumber === 'dots') {
            return (
              <Button
                key={`dots-${index}`}
                isDisabled
                aria-hidden="true"
                variant="ghost"
              >
                ⋯
              </Button>
            );
          }

          const page = pageNumber as number;
          const isCurrentPage = page === currentPage;

          return (
            <Button
              key={isCurrentPage ? 'current' : `page-${page}`}
              aria-current={isCurrentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
              size="sm"
              variant={isCurrentPage ? 'secondary' : 'ghost'}
              onPress={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Next Page Button */}
      <Button
        isIconOnly
        aria-label="Go to next page"
        isDisabled={isLastPage}
        size="sm"
        variant="ghost"
        onPress={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight />
      </Button>

      {/* Last Page Button */}
      <Button
        isIconOnly
        aria-label="Go to last page"
        className="hidden sm:flex"
        isDisabled={isLastPage}
        size="sm"
        variant="ghost"
        onPress={() => onPageChange(totalPages)}
      >
        <ChevronsRight />
      </Button>

      {/* Page Info - Screen Reader Only */}
      <span className="sr-only">
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  );
}

/**
 * Pagination Info Component
 *
 * Displays current page and total pages information
 * Can be used alongside the Pagination component
 */
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  className = '',
}: PaginationInfoProps) {
  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className={`text-center text-sm text-default-600 ${className}`}
    >
      Halaman <span className="font-semibold">{currentPage}</span> dari{' '}
      <span className="font-semibold">{totalPages}</span>
    </div>
  );
}

/**
 * Example Usage:
 *
 * ```tsx
 * const [currentPage, setCurrentPage] = useState(1);
 * const totalPages = 10;
 *
 * return (
 *   <div className="space-y-4">
 *     <Pagination
 *       currentPage={currentPage}
 *       totalPages={totalPages}
 *       siblings={1}
 *       onPageChange={setCurrentPage}
 *     />
 *     <PaginationInfo currentPage={currentPage} totalPages={totalPages} />
 *   </div>
 * );
 * ```
 */
