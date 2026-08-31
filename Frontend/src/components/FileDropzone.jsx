import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { formatBytes } from "../lib/format";

export default function FileDropzone({ files = [], onChange }) {
  const [drag, setDrag] = useState(false);

  const addFiles = useCallback(
    (list) => {
      const imageFiles = Array.from(list).filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      const promises = imageFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target.result;
            resolve({
              id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
              filename: file.name,
              size: file.size,
              preview: dataUrl,
              url: dataUrl,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then((newFiles) => {
        onChange([...(files || []), ...newFiles]);
      });
    },
    [files, onChange],
  );

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          drag ? "border-[#0E4B4C] bg-[#D7F5DE]/30" : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D7F5DE] text-[#0E4B4C] mb-2">
          <Upload size={22} />
        </div>
        <p className="font-semibold text-slate-800">Drop photos here</p>
        <p className="text-xs text-slate-500 mt-1">PNG, JPG, or WEBP up to 10MB (Used for AI severity assessment)</p>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {files.map((file) => (
            <li key={file.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              {file.preview || file.url ? (
                <img src={file.url || file.preview} alt={file.filename} className="h-12 w-12 rounded-lg object-cover border border-slate-100" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  <ImageIcon size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{file.filename}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(files.filter((f) => f.id !== file.id))}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Remove photo"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
