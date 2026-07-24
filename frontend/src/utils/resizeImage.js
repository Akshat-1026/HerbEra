/**
 * Resize an image file to target dimensions using canvas.
 * Returns a base64 data URL string.
 */
export function resizeImage(file, { width = 800, height = 1120, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // Cover — fill the canvas, crop overflow from center
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let sx, sy, sw, sh;

        if (imgRatio > canvasRatio) {
          // Image is wider — crop sides
          sh = img.height;
          sw = sh * canvasRatio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          // Image is taller — crop top/bottom
          sw = img.width;
          sh = sw / canvasRatio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
