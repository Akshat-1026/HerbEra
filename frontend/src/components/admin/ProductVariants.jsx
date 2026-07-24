import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, PackageX } from "lucide-react";

const emptyVariant = () => ({
  label: "",
  sku: "",
  price: "",
  originalPrice: "",
  countInStock: "",
  lowStockAlert: "",
  barcode: "",
  active: true,
  isDefault: false,
});

function VariantCard({ variant, index, onChange, onDelete }) {
  const isOutOfStock = Number(variant.countInStock) === 0;

  const update = (key, value) => {
    const updated = { ...variant, [key]: value };
    onChange(index, updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative rounded-2xl border shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${isOutOfStock || variant.active === false ? "border-zinc-200/40 bg-zinc-50/40 opacity-70" : "border-zinc-200/80 bg-white/80 hover:border-emerald-200/60"}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold ${isOutOfStock ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-700"}`}>
              {isOutOfStock ? <PackageX size={14} /> : String(index + 1).padStart(2, "0")}
            </div>
            <h3 className="text-sm font-semibold text-zinc-800">Variant {index + 1}</h3>
            {isOutOfStock && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600">Out of Stock</span>
            )}
            {variant.active === false && !isOutOfStock && (
              <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Inactive</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={variant.active !== false}
                onChange={(e) => update("active", e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:duration-300 peer-checked:bg-emerald-500 peer-checked:after:translate-x-full" />
              <span className="ml-2.5 text-xs font-medium text-zinc-500 peer-checked:text-emerald-600">
                {variant.active !== false ? "Active" : "Inactive"}
              </span>
            </label>
            <button
              type="button"
              onClick={() => onDelete(index)}
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Variant Name</label>
            <input
              value={variant.label}
              onChange={(e) => update("label", e.target.value)}
              placeholder="e.g. 30 Capsules"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">SKU</label>
            <input
              value={variant.sku}
              onChange={(e) => update("sku", e.target.value)}
              placeholder="e.g. HE-AS-30C"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/10 font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Barcode (Optional)</label>
            <input
              value={variant.barcode}
              onChange={(e) => update("barcode", e.target.value)}
              placeholder="e.g. 8901234567890"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/10 font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={variant.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="499"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Discount Price (Optional)</label>
            <input
              type="number"
              step="0.01"
              value={variant.originalPrice}
              onChange={(e) => update("originalPrice", e.target.value)}
              placeholder="399"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Stock Quantity</label>
            <input
              type="number"
              value={variant.countInStock}
              onChange={(e) => update("countInStock", e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/10"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Low Stock Alert</label>
            <input
              type="number"
              value={variant.lowStockAlert}
              onChange={(e) => update("lowStockAlert", e.target.value)}
              placeholder="5"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-500/10"
            />
          </div>
            <div className="flex items-end pb-2">
            <label className="relative flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 transition-all duration-200 hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
              <input
                type="radio"
                name="default-variant"
                checked={variant.isDefault || false}
                onChange={(e) => update("isDefault", e.target.checked)}
                className="h-4 w-4 border-zinc-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-zinc-600">Default Variant</span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductVariants({ variants = [], onChange }) {
  const handleChange = (index, updated) => {
    const next = variants.map((v, i) =>
      i === index ? updated : { ...v, isDefault: updated.isDefault ? false : v.isDefault }
    );
    onChange(next);
  };

  const handleDelete = (index) => {
    const next = variants.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...variants, emptyVariant()]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-800">Product Variants</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Create multiple purchasable options such as capsule count, weight, or volume.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-[0_4px_16px_rgba(46,139,87,0.25)] active:scale-[0.97]"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Variant
        </button>
      </div>

      <AnimatePresence initial={false}>
        {variants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <Plus size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-zinc-700">No variants yet</p>
            <p className="mt-1 text-xs text-zinc-400">Click "Add Variant" to create your first purchasable option.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {variants.map((variant, index) => (
              <VariantCard
                key={index}
                variant={variant}
                index={index}
                onChange={handleChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ProductVariants, emptyVariant }; // eslint-disable-line react-refresh/only-export-components
