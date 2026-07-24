function Loader({ size = "md", fullScreen = false }) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div
      className={`flex justify-center items-center ${
        fullScreen ? "min-h-screen" : "py-20"
      }`}
    >
      <div
        className={`${sizeClasses[size]} border-green-600 border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}

export default Loader;