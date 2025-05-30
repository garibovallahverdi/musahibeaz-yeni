
import React from "react";

type PaginationProps = {
  onNextPage: () => void;
  hasNextPage: boolean;
};

const Pagination = ({ onNextPage, hasNextPage }: PaginationProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        onClick={onNextPage}
        disabled={!hasNextPage}
      >
        Daha çox
      </button>
    </div>
  );
};

export default Pagination;