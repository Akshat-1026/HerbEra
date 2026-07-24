import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ProductSkeleton() {
  return (
    <SkeletonTheme
      baseColor="#d1d5db"
      highlightColor="#f3f4f6"
    >
      <div className="rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-lg border border-gray-200 dark:border-gray-700">

        {/* IMAGE */}
        <Skeleton
          height={220}
          borderRadius={20}
        />

        {/* TITLE */}
        <Skeleton
          height={28}
          className="mt-4"
        />

        {/* CATEGORY */}
        <Skeleton
          height={20}
          width={120}
          className="mt-3"
        />

        {/* PRICE */}
        <Skeleton
          height={25}
          width={80}
          className="mt-3"
        />

        {/* BUTTON */}
        <Skeleton
          height={45}
          className="mt-5"
          borderRadius={12}
        />

      </div>
    </SkeletonTheme>
  );
}

export default ProductSkeleton;