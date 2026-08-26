import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { formatBytes } from "../lib/format";

export default function FileDropzone({ files = [], onChange }) {
  const [drag, setDrag] = useState(false);

  const addFiles = useCallback(
    (list) => {
      const next = Array.from(list).map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        filename: file.name,
        size: file.size,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      }));
      onChange([...(files || []), ...next]);
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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center ${
          drag ? "border-primary bg-highlight" : "border-slate-300 bg-white"
        }`}
      >
        <Upload className="text-primary" />
        <p className="mt-2 font-semibold text-slate-800">Drop photos or videos here</p>
        <p className="text-sm text-slate-500">or click to browse. Used for AI severity assessment.</p>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {files.map((file) => (
            <li key={file.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              {file.preview ? (
                <img src={file.preview} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs">VID</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file.filename}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(files.filter((f) => f.id !== file.id))}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Remove file"
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
