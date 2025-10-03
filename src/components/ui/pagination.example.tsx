'use client';

import { useState } from 'react';

import { Pagination, PaginationInfo } from './pagination';

/**
 * Example 1: Basic Pagination
 */
export function BasicPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-xl font-semibold">Basic Pagination</h2>

      <Pagination
        currentPage={currentPage}
        siblings={1}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <PaginationInfo currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

/**
 * Example 2: Pagination with More Siblings
 */
export function AdvancedPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 50;

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-xl font-semibold">Pagination with More Siblings</h2>

      <Pagination
        currentPage={currentPage}
        siblings={2}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <PaginationInfo currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

/**
 * Example 3: Pagination with Data Fetching
 */
export function DataFetchingPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Simulated data - replace with your actual data fetching
  const totalItems = 240;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Here you would typically:
    // 1. Update URL with new page number
    // 2. Fetch new data
    // 3. Scroll to top
    // Example: fetchData(page);
  };

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-xl font-semibold">Pagination with Data Fetching</h2>

      {/* Your data grid/list here */}
      <div className="grid min-h-[400px] grid-cols-4 gap-4">
        {Array.from({ length: pageSize }, (_, i) => (
          <div
            key={i}
            className="flex h-32 items-center justify-center rounded-lg border border-default-200 bg-default-100"
          >
            Item {(currentPage - 1) * pageSize + i + 1}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Pagination
          currentPage={currentPage}
          siblings={1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <PaginationInfo currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}

/**
 * Example 4: Integration with URL Search Params (Next.js)
 */
export function URLPaginationExample() {
  // This would typically use useSearchParams from next/navigation
  // or nuqs for better type safety
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 20;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Update URL - example with nuqs or useSearchParams
    // setSearchParams({ page: page.toString() });

    // Or with router.push
    // router.push(`/your-path?page=${page}`);
  };

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-xl font-semibold">URL-Synced Pagination</h2>

      <Pagination
        currentPage={currentPage}
        siblings={1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <PaginationInfo currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
