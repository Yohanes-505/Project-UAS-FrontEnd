/** Foto bawaan yang bisa dipilih di editor Menu dan Promo (path relatif ke folder public/). */
export const PHOTO_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "images/menu/rendang.jpg", label: "Rendang" },
  { value: "images/hero/rendang.jpg", label: "Rendang (2)" },
  { value: "images/hero/ayampop.jpg", label: "Ayam Pop" },
  { value: "images/menu/ayambakar.jpg", label: "Ayam Bakar" },
  { value: "images/menu/dendengbalado.jpg", label: "Dendeng Balado" },
  { value: "images/menu/gulaitunjang.jpg", label: "Gulai Tunjang" },
  { value: "images/menu/gulaiikan.jpg", label: "Gulai Ikan" },
  { value: "images/menu/telurbalado.jpg", label: "Telur Balado" },
  { value: "images/menu/perkedel.jpg", label: "Perkedel" },
  { value: "images/hero/nasipadang.jpg", label: "Nasi Padang" },
];

/**
 * Kecilkan foto upload (sisi terpanjang maks `maxSize` px, JPEG) supaya hemat
 * kuota localStorage (±5 MB). Hasilnya data URL.
 */
export function resizeImage(file: File, maxSize = 600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File tidak bisa dibaca."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("File tersebut bukan gambar yang valid."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Browser tidak mendukung pengolahan gambar."));
          return;
        }
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
