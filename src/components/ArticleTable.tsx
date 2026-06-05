/**
 * DOI Prefix Publication Dashboard - Article Table Component
 * Creator: Ikhwan Arief (ikhwan@unand.ac.id)
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
            className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-white font-bold cursor-pointer"
          >
            <span>Year</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="font-semibold text-slate-700 dark:text-slate-300">
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
              <span className="font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                {title}
              </span>
              {article.subtitle && (
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 italic">
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
            <span className="text-slate-600 dark:text-slate-300 text-[13px] line-clamp-2">
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
          <span className="text-slate-600 dark:text-slate-300 text-[13px] line-clamp-2 font-medium">
            {info.getValue() as string}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "doi",
        header: "DOI",
        cell: (info) => {
          const doi = info.getValue() as string;
          return (
            <code className="text-slate-500 dark:text-slate-400 text-[11px] font-mono select-all break-all">
              {doi}
            </code>
          );
        },
        size: 150,
      },
      {
        accessorKey: "citedByCount",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-white font-bold cursor-pointer"
          >
            <span>Cited By</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: (info) => {
          const count = info.getValue() as number;
          return (
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
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
                className="flex items-center justify-center p-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/35 rounded-lg border border-sky-100 dark:border-sky-900/30 transition-all cursor-pointer"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              <a
                href={article.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open DOI link"
                className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto min-w-full">
        <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-800 text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400"
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
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 text-sm font-medium"
                >
                  No matching publications found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-850">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Rows per page:
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none transition-all cursor-pointer"
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
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-3">
              Page{" "}
              <strong className="text-slate-700 dark:text-slate-200 font-bold">
                {table.getState().pagination.pageIndex + 1}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-700 dark:text-slate-200 font-bold">
                {table.getPageCount()}
              </strong>
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
