"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchItems, queryKeys, type ItemsResponse } from "@/lib/api";
import { ItemCard } from "./ItemCard";

type SearchForm = { search: string };

export function ItemsBrowser({
  initialData,
}: {
  initialData: ItemsResponse;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { register, handleSubmit, reset } = useForm<SearchForm>({
    defaultValues: { search: "" },
  });

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.items(search, page),
    queryFn: () => fetchItems(search, page),
    placeholderData: keepPreviousData,
    // seed the first page from server-rendered data (bonus: hydration)
    initialData:
      search === "" && page === 1 ? initialData : undefined,
  });

  function onSubmit(values: SearchForm) {
    setSearch(values.search.trim());
    setPage(1);
  }

  function clearSearch() {
    reset({ search: "" });
    setSearch("");
    setPage(1);
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="row"
        style={{ marginBottom: 20 }}
      >
        <input
          className="input"
          placeholder="Search books by title…"
          {...register("search")}
        />
        <button className="btn primary" type="submit">
          Search
        </button>
        {search && (
          <button className="btn" type="button" onClick={clearSearch}>
            Clear
          </button>
        )}
      </form>

      {search && (
        <p className="muted" style={{ marginTop: 0 }}>
          Results for “{search}” — {data?.total ?? 0} found
        </p>
      )}

      {items.length === 0 ? (
        <p className="muted">No books found.</p>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <span className="muted">
            Page {page} / {totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
