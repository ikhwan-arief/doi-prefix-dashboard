/**
 * DOI Prefix Publication Dashboard - Article Table Component
 * Redesigned to Seline Analytics Style Guidelines
 */

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Eye, ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Article } from "../lib/types";
import { formatAuthorsList } from "../lib/normalize";

interface ArticleTableProps {
  data: Article[];
  onViewDetails: (article: Article) => void;
}

export const ArticleTable: React.FC<ArticleTableProps> = ({ data, onViewDetails }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        accessorKey: "year",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-seline-blue font-medium cursor-pointer"
          >
            <span>Year</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-seline-soft-slate" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="font-medium text-seline-ink text-sm">
            {info.getValue() as number ?? "-"}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: (info) => {
          const title = info.getValue() as string;
          const article = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-seline-ink leading-snug line-clamp-2">
                {title}
              </span>
              {article.subtitle && (
                <span className="text-xs text-seline-slate mt-0.5 line-clamp-1 italic">
                  {article.subtitle}
                </span>
              )}
            </div>
          );
        },
        size: 350,
      },
      {
        accessorKey: "authors",
        header: "Authors",
        cell: (info) => {
          const authors = info.getValue() as any[];
          return (
            <span className="text-seline-slate text-[13px] line-clamp-2">
              {formatAuthorsList(authors)}
            </span>
          );
        },
        size: 180,
      },
      {
        accessorKey: "journal",
        header: "Journal",
        cell: (info) => (
          <span className="text-seline-slate text-[13px] line-clamp-2 font-medium">
            {info.getValue() as string}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "citedByCount",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-seline-blue font-medium cursor-pointer"
          >
            <span>Cited By</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-seline-soft-slate" />
            )}
          </button>
        ),
        cell: (info) => {
          const count = info.getValue() as number;
          return (
            <span 
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                count > 0 
                  ? "bg-seline-wash text-seline-ink font-semibold" 
                  : "bg-seline-cream border border-seline-pearl-border text-seline-slate"
              }`}
              title="Citations counted directly by Crossref"
            >
              {count}
            </span>
          );
        },
        size: 100,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const article = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDetails(article)}
                title="View full details"
                className="flex items-center justify-center p-2 text-seline-blue hover:bg-seline-wash/20 border border-seline-pearl-border rounded-full transition-all cursor-pointer"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              <a
                href={article.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open DOI link"
                className="flex items-center justify-center p-2 text-seline-slate hover:text-seline-ink border border-seline-pearl-border hover:bg-seline-cream rounded-full transition-all cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          );
        },
        size: 100,
      },
    ],
    [onViewDetails]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-seline-white rounded-seline-cards border border-seline-pearl-border shadow-seline-sm overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto min-w-full">
        <table className="min-w-full divide-y divide-seline-pearl-border text-left">
          <thead className="bg-seline-cream text-seline-slate text-xs font-medium uppercase tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 font-medium text-seline-slate"
                    style={{ width: header.column.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-seline-pearl-border bg-seline-white text-seline-ink">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-seline-slate text-sm font-medium"
                >
                  No matching publications found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-seline-cream/40 transition-all"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-seline-cream border-t border-seline-pearl-border">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-seline-slate font-medium">
              Rows per page:
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-2 py-1 bg-seline-white border border-seline-warm-border rounded-seline-inputs text-seline-slate text-xs font-semibold focus:outline-none transition-all cursor-pointer h-[32px]"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-full border border-seline-pearl-border bg-seline-white text-seline-slate hover:bg-seline-cream disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-full border border-seline-pearl-border bg-seline-white text-seline-slate hover:bg-seline-cream disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs text-seline-slate font-medium px-3">
              Page{" "}
              <strong className="text-seline-ink font-semibold">
                {table.getState().pagination.pageIndex + 1}
              </strong>{" "}
              of{" "}
              <strong className="text-seline-ink font-semibold">
                {table.getPageCount()}
              </strong>
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-full border border-seline-pearl-border bg-seline-white text-seline-slate hover:bg-seline-cream disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-full border border-seline-pearl-border bg-seline-white text-seline-slate hover:bg-seline-cream disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
