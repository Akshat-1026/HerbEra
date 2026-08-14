import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import { resizeImage } from "../../utils/resizeImage";

const ImageUpload = ({ value, onChange, label = "Image", width = 800, height = 800, quality = 0.85, required = false, hint = "", showUrlInput = true }) => {
  const [resizing, setResizing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    try {
      setResizing(true);
      const resized = await resizeImage(file, { width, height, quality });
      onChange(resized);
      toast.success(`Image uploaded (${width}×${height})`);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setResizing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const inputClass = "w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white";

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {value && (
        <div className="relative mb-3 inline-block">
          <img src={value} alt="Preview" className="h-40 w-auto max-w-full rounded-lg border border-zinc-200 dark:border-zinc-700 object-cover" />
          <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={resizing} className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50">
          <Upload size={16} />
          {resizing ? "Uploading…" : "Upload Image"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      </div>
      {hint && <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>}
      {showUrlInput && (
        <>
          <p className="mt-1.5 text-xs text-zinc-400">Or paste an image URL below</p>
          <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className={`mt-1 ${inputClass}`} />
        </>
      )}
    </div>
  );
};

export default ImageUpload;
