function SkeletonCard() {
  return (
    <div
      className="
        animate-pulse
        bg-white
        dark:bg-gray-900
        rounded-2xl
        shadow-md
        overflow-hidden
        border
        border-gray-200
        dark:border-gray-700
      "
    >

      {/* IMAGE */}
      <div className="h-64 bg-gray-300 dark:bg-gray-700"></div>

      {/* CONTENT */}
      <div className="p-4">

        {/* CATEGORY */}
        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>

        {/* TITLE */}
        <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>

        {/* RATING */}
        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>

        {/* PRICE */}
        <div className="h-6 w-28 bg-gray-300 dark:bg-gray-700 rounded mb-5"></div>

        {/* BUTTONS */}
        <div className="flex gap-3">

          <div className="flex-1 h-10 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>

          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>

        </div>

      </div>

    </div>
  );
}

export default SkeletonCard;