import { useMemo } from "react";
import { useDebounce } from "../hooks";

interface JobSearchBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  categories: string[];
  category: string;
  onCategoryChange: (value: string) => void;
}

/** Search bar dengan debounce 400ms + filter kategori. */
export function JobSearchBar({
  keyword,
  onKeywordChange,
  categories,
  category,
  onCategoryChange,
}: JobSearchBarProps) {
  const debouncedKeyword = useDebounce(keyword, 400);
  const isPending = keyword !== debouncedKeyword;

  const options = useMemo(
    () =>
      categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      )),
    [categories],
  );

  return (
    <div className="job-search">
      <input
        type="search"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="Cari posisi / perusahaan…"
        aria-label="Cari lowongan"
      />
      {isPending && <span className="pending-dot" title="debounce 400ms" />}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter kategori"
      >
        <option value="">Semua kategori</option>
        {options}
      </select>
    </div>
  );
}
