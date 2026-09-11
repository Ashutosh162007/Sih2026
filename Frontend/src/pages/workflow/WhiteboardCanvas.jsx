import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  Eraser,
  MousePointer2,
  PenTool,
  Save,
  Square,
  TextCursorInput,
  Undo2,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useLanguageStore } from "../../store/languageStore";

const W = 1600;
const H = 1000;
const COLORS = ["#0E4B4C", "#0891B2", "#059669", "#7C3AED", "#D97706", "#DC2626", "#1f2937"];
const WIDTHS = [3, 5, 8];

const TOOLS = [
  { id: "select", icon: MousePointer2 },
  { id: "draw", icon: PenTool },
  { id: "rect", icon: Square },
  { id: "ellipse", icon: Circle },
  { id: "arrow", icon: ArrowUpRight },
  { id: "text", icon: TextCursorInput },
];

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function objBounds(o) {
  if (o.kind === "stroke") {
    if (!o.points || o.points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const xs = o.points.map((p) => p.x);
    const ys = o.points.map((p) => p.y);
    return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  }
  if (o.kind === "arrow") {
    return { minX: Math.min(o.x, o.x2), minY: Math.min(o.y, o.y2), maxX: Math.max(o.x, o.x2), maxY: Math.max(o.y, o.y2) };
  }
  if (o.kind === "text") {
    const fs = o.fontSize || 36;
    const lineH = fs * 1.28;
    const approxWidth = o.w > 0 ? o.w : Math.max(...(o.text || "T").split("\n").map((l) => l.length)) * fs * 0.6;
    const lines = String(o.text || "").split("\n");
    return { minX: o.x, minY: o.y, maxX: o.x + approxWidth, maxY: o.y + Math.max(lines.length, 1) * lineH };
  }
  return {
    minX: Math.min(o.x, o.x + o.w),
    minY: Math.min(o.y, o.y + o.h),
    maxX: Math.max(o.x, o.x + o.w),
    maxY: Math.max(o.y, o.y + o.h),
  };
}

function hitTest(o, px, py, ctx) {
  const pad = 8;
  if (o.kind === "stroke") {
    const pts = o.points || [];
    for (let i = 1; i < pts.length; i += 1) {
      if (distToSegment(px, py, pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y) <= Math.max(6, o.strokeWidth || 3)) {
        return true;
      }
    }
    return pts.length > 0 && Math.hypot(px - pts[0].x, py - pts[0].y) <= Math.max(8, o.strokeWidth || 3);
  }
  if (o.kind === "arrow") {
    return distToSegment(px, py, o.x, o.y, o.x2, o.y2) <= 8;
  }
  if (o.kind === "text") {
    const fs = o.fontSize || 36;
    const lineH = fs * 1.28;
    const lines = wrapLines(o.text, o.w || 0, ctx, fs);
    const width = o.w > 0 ? o.w : Math.max(...(lines.length ? lines.map((l) => (ctx ? ctx.measureText(l).width : l.length * fs * 0.6)) : [10]));
    return (
      px >= o.x - pad &&
      px <= o.x + width + pad &&
      py >= o.y - pad &&
      py <= o.y + Math.max(lines.length, 1) * lineH + pad
    );
  }
  const b = objBounds(o);
  return px >= b.minX - pad && px <= b.maxX + pad && py >= b.minY - pad && py <= b.maxY + pad;
}

function drawArrowhead(ctx, x, y, angle, size) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function wrapLines(text, maxW, ctx, fs) {
  ctx.save();
  ctx.font = `${fs}px 'Plus Jakarta Sans', system-ui, sans-serif`;
  const lines = [];
  const paragraphs = String(text || "").split("\n");
  for (const para of paragraphs) {
    if (!para) { lines.push(""); continue; }
    if (!maxW || maxW <= 0) { lines.push(para); continue; }
    const words = para.split(/\s+/);
    let cur = "";
    for (const wd of words) {
      const trial = cur ? `${cur} ${wd}` : wd;
      if (ctx.measureText(trial).width <= maxW) cur = trial;
      else { if (cur) lines.push(cur); cur = wd; }
    }
    if (cur) lines.push(cur);
  }
  ctx.restore();
  return lines;
}

function drawObject(ctx, o) {
  ctx.save();
  ctx.strokeStyle = o.color || "#0E4B4C";
  ctx.fillStyle = o.color || "#0E4B4C";
  ctx.lineWidth = o.strokeWidth || 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (o.kind === "stroke") {
    const pts = o.points || [];
    if (pts.length > 0) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
  } else if (o.kind === "rect") {
    const x = Math.min(o.x, o.x + o.w);
    const y = Math.min(o.y, o.y + o.h);
    ctx.strokeRect(x, y, Math.abs(o.w), Math.abs(o.h));
  } else if (o.kind === "ellipse") {
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(o.w) / 2, Math.abs(o.h) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (o.kind === "arrow") {
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(o.x2, o.y2);
    ctx.stroke();
    const angle = Math.atan2(o.y2 - o.y, o.x2 - o.x);
    drawArrowhead(ctx, o.x2, o.y2, angle, 16);
  } else if (o.kind === "text") {
  ctx.font = `${Math.max(10, o.fontSize || 36)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
  ctx.textBaseline = "top";
  const lines = wrapLines(o.text, o.w || 0, ctx, o.fontSize || 36);
  const lineH = (o.fontSize || 36) * 1.28;
  lines.forEach((ln, i) => ctx.fillText(ln, o.x, o.y + i * lineH));
  }
  ctx.restore();
}

function SelectionBox({ ctx, o }) {
  const b = objBounds(o);
  if (o.kind === "stroke" && (!o.points || o.points.length === 0)) return;
  ctx.save();
  ctx.strokeStyle = "#0E4B4C";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.strokeRect(b.minX - 6, b.minY - 6, b.maxX - b.minX + 12, b.maxY - b.minY + 12);
  ctx.restore();
}

export default function WhiteboardCanvas({ objects, editable, onSave, suggested }) {
  const { t } = useLanguageStore();

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const objectsRef = useRef(objects);
  const editableRef = useRef(editable);
  const toolRef = useRef("select");
  const widthRef = useRef(3);
  const selectedRef = useRef(null);

  const drawingRef = useRef(null);
  const historyRef = useRef([]);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef(null);

  const [tool, setTool] = useState("select");
  const [color, setColor] = useState(COLORS[0]);
  const colorRef = useRef("#0E4B4C");
  colorRef.current = color;
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [selected, setSelected] = useState(null);
  const [pending, setPending] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | dirty | saving | saved
  const [textEdit, setTextEdit] = useState(null); // { x, y, value, editingId }
  const [displayW, setDisplayW] = useState(0);

  const textEditRef = useRef(null);
  textEditRef.current = textEdit;

  useEffect(() => {
    objectsRef.current = objects;
    dirtyRef.current = false;
    setSaveState("idle");
  }, [objects]);

  useEffect(() => {
    editableRef.current = editable;
  }, [editable]);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  useEffect(() => {
    widthRef.current = strokeWidth;
  }, [strokeWidth]);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const wrap = wrapRef.current;
    const dpr = window.devicePixelRatio || 1;
    const cssW = wrap ? wrap.clientWidth : canvas.clientWidth;
    const cssH = (cssW / W) * H;
    const need = canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr);
    if (need) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      if (displayW !== cssW) setDisplayW(cssW);
    }
    ctx.setTransform((dpr * cssW) / W, 0, 0, (dpr * cssH) / H, 0, 0);
    ctx.clearRect(0, 0, W, H);
    return ctx;
  }, [displayW]);

  const draw = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const editingId = textEditRef.current?.editingId || null;
    (objectsRef.current || []).forEach((o) => {
      if (editingId && o.id === editingId) return;
      drawObject(ctx, o);
    });
    if (pendingRef.current) {
      if (pendingRef.current.kind === "textbox") {
        const p = pendingRef.current;
        ctx.save();
        ctx.strokeStyle = p.color || "#0E4B4C";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 7]);
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = p.color || "#0E4B4C";
        ctx.font = "bold 15px 'Plus Jakarta Sans', system-ui, sans-serif";
        ctx.textBaseline = "top";
        ctx.fillText("Aa", p.x + 8, p.y + 8);
        ctx.restore();
      } else {
        drawObject(ctx, pendingRef.current);
      }
    }
    if (selectedRef.current) {
      const cur = objectsRef.current.find((o) => o.id === selectedRef.current) ||
        (pendingRef.current && pendingRef.current.id === selectedRef.current ? pendingRef.current : null);
      if (cur && !(editingId && cur.id === editingId)) SelectionBox({ ctx, o: cur });
    }
  }, [getCtx]);

  const pendingRef = useRef(null);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw, objects, pending, selected, textEdit]);

  const logicalPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  }, []);

  const pushHistory = useCallback(() => {
    historyRef.current.push(JSON.parse(JSON.stringify(objectsRef.current || [])));
    if (historyRef.current.length > 60) historyRef.current.shift();
  }, []);

  const markDirty = useCallback((immediate) => {
    dirtyRef.current = true;
    setSaveState("dirty");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveState("saving");
      onSave(JSON.parse(JSON.stringify(objectsRef.current || [])));
    }, immediate ? 0 : 1200);
  }, [onSave]);

  const commit = useCallback((objectsList, opts) => {
    objectsRef.current = objectsList;
    setSaveState((s) => s);
    if (opts?.save !== false) markDirty();
    else dirtyRef.current = false;
    draw();
  }, [markDirty, draw]);

  const addObject = useCallback((o, finish) => {
    const list = [...(objectsRef.current || []), o];
    if (finish) pushHistory();
    commit(list, finish ? undefined : { save: false });
    if (finish) setSelected(o.id);
  }, [commit, pushHistory]);

  const handlePointerDown = useCallback((e) => {
    if (!editableRef.current) return;
    if (textEditRef.current) {
      finishTextEdit(false);
      return;
    }
    canvasRef.current.setPointerCapture(e.pointerId);
    const { x, y } = logicalPos(e);
    const active = toolRef.current;
    setSelected(null);

    if (active === "select") {
      const rev = [...(objectsRef.current || [])].reverse();
      const hit = rev.find((o) => hitTest(o, x, y, canvasRef.current.getContext("2d")));
      if (hit) {
        setSelected(hit.id);
        drawingRef.current = { mode: "move", id: hit.id, start: { x, y }, moved: 0 };
      }
      return;
    }
    if (active === "draw") {
      drawingRef.current = {
        mode: "draw",
        obj: {
          id: `obj-${Date.now()}`,
          kind: "stroke",
          x: 0, y: 0, w: 0, h: 0, x2: 0, y2: 0,
          points: [{ x, y }],
          text: "",
          fontSize: 20,
          color: colorRef.current,
          strokeWidth: widthRef.current,
        },
      };
      return;
    }
    if (active === "rect" || active === "ellipse" || active === "arrow") {
      drawingRef.current = {
        mode: "shape",
        kind: active,
        start: { x, y },
        obj: {
          id: `obj-${Date.now()}`,
          kind: active,
          x, y, w: 0, h: 0, x2: active === "arrow" ? x : 0, y2: active === "arrow" ? y : 0,
          points: [],
          text: "",
          fontSize: 20,
          color: colorRef.current,
          strokeWidth: widthRef.current,
        },
      };
      return;
    }
    if (active === "text") {
      drawingRef.current = { mode: "textbox", start: { x, y } };
      return;
    }
  }, [logicalPos]);

  const handlePointerMove = useCallback((e) => {
    const d = drawingRef.current;
    if (!d) return;
    const { x, y } = logicalPos(e);
    if (d.mode === "draw") {
      const last = d.obj.points[d.obj.points.length - 1];
      if (last && Math.hypot(x - last.x, y - last.y) < 2.5) return;
      d.obj.points = [...d.obj.points, { x, y }];
      const list = [...(objectsRef.current || [])];
      const idx = list.findIndex((o) => o.id === d.obj.id);
      if (idx >= 0) list[idx] = d.obj;
      else list.push(d.obj);
      objectsRef.current = list;
      pendingRef.current = null;
      draw();
    } else if (d.mode === "shape") {
      d.obj.w = x - d.start.x;
      d.obj.h = y - d.start.y;
      if (d.kind === "arrow") { d.obj.x2 = x; d.obj.y2 = y; d.obj.w = 0; d.obj.h = 0; }
      pendingRef.current = d.obj;
      draw();
    } else if (d.mode === "textbox") {
      const box = {
        x: Math.min(d.start.x, x),
        y: Math.min(d.start.y, y),
        w: Math.abs(x - d.start.x),
        h: Math.abs(y - d.start.y),
      };
      d.box = box;
      pendingRef.current = { kind: "textbox", ...box, color: colorRef.current };
      draw();
    } else if (d.mode === "move") {
      const list = [...(objectsRef.current || [])];
      const idx = list.findIndex((o) => o.id === d.id);
      if (idx >= 0) {
        const o = list[idx];
        const dx = x - d.start.x;
        const dy = y - d.start.y;
        d.moved = (d.moved || 0) + Math.abs(dx) + Math.abs(dy);
        if (o.kind === "stroke" && Array.isArray(o.points)) {
          o.points = o.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        } else {
          o.x += dx;
          o.y += dy;
          if (o.kind === "arrow") {
            o.x2 += dx;
            o.y2 += dy;
          }
        }
        list[idx] = o;
        objectsRef.current = list;
        d.start = { x, y };
        draw();
      }
    }
  }, [logicalPos, draw]);

  const clampRound = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));

  const measureLineWidth = useCallback((text, fontSize) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return text.length * fontSize * 0.6;
    ctx.save();
    ctx.font = `${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const w = text.length === 0 ? 0 : ctx.measureText(text).width;
    ctx.restore();
    return w;
  }, []);

  const computeTextMetrics = useCallback((text, fontSize) => {
    const lines = String(text || "").split("\n");
    const maxLineW = Math.max(...lines.map((l) => measureLineWidth(l, fontSize)), 0);
    const w = Math.max(120, Math.round(maxLineW + fontSize * 1.2));
    const h = Math.round(lines.length * fontSize * 1.28 + fontSize * 0.5);
    return { w, h };
  }, [measureLineWidth]);

  const openTextEditor = useCallback((box = {}) => {
    const x = box.x ?? 150;
    const y = box.y ?? 120;
    const fontSize = box.fontSize || 36;
    const { w, h } = computeTextMetrics("", fontSize);
    setTextEdit({
      key: Date.now(),
      x, y, w, h, fontSize,
      value: "",
      editingId: null,
    });
  }, [computeTextMetrics]);

  const handlePointerUp = useCallback(() => {
    const d = drawingRef.current;
    if (!d) return;
    drawingRef.current = null;
    if (d.mode === "draw") {
      const pts = d.obj.points || [];
      if (pts.length > 1) {
        pushHistory();
        objectsRef.current = [...(objectsRef.current || []), d.obj];
        setSelected(d.obj.id);
        markDirty();
        draw();
      }
    } else if (d.mode === "shape") {
      if (d.kind === "arrow") {
        if (Math.hypot(d.obj.x2 - d.obj.x, d.obj.y2 - d.obj.y) < 4) { pendingRef.current = null; draw(); return; }
      } else if (Math.abs(d.obj.w) < 5 && Math.abs(d.obj.h) < 5) {
        pendingRef.current = null; draw(); return;
      }
      pushHistory();
      objectsRef.current = [...(objectsRef.current || []), d.obj];
      pendingRef.current = null;
      setSelected(d.obj.id);
      markDirty();
      draw();
    } else if (d.mode === "textbox") {
      pendingRef.current = null;
      const box = d.box || {};
      if (box.w >= 40 && box.h >= 24) {
        openTextEditor({
          x: box.x,
          y: box.y,
          w: box.w,
          h: box.h,
          fontSize: clampRound(box.h * 0.72, 16, 160),
        });
      } else {
        openTextEditor({ x: d.start.x, y: d.start.y, w: 260, h: 46, fontSize: 36 });
      }
      draw();
    } else if (d.mode === "move") {
      if ((d.moved || 0) >= 6) {
        pushHistory();
        markDirty();
      }
    }
  }, [markDirty, pushHistory, draw, openTextEditor, clampRound]);

  const finishTextEdit = useCallback((cancel) => {
    const te = textEditRef.current;
    if (!te) return;
    if (!cancel && te.value?.trim()) {
      if (te.editingId) {
        const list = [...(objectsRef.current || [])];
        const idx = list.findIndex((o) => o.id === te.editingId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], text: te.value.trim(), w: 0, fontSize: te.fontSize };
          pushHistory();
          objectsRef.current = list;
          markDirty();
          draw();
        }
      } else {
        const obj = {
          id: `obj-${Date.now()}`,
          kind: "text",
          x: te.x, y: te.y, w: 0, h: 0, x2: 0, y2: 0,
          points: [],
          text: te.value.trim(),
          fontSize: te.fontSize || 36,
          color: colorRef.current,
          strokeWidth: 3,
        };
        pushHistory();
        objectsRef.current = [...(objectsRef.current || []), obj];
        setSelected(obj.id);
        markDirty();
        draw();
      }
    }
    setTextEdit(null);
    textEditRef.current = null;
  }, [markDirty, pushHistory, draw]);

  const undo = useCallback(() => {
    if (!editableRef.current) return;
    if (textEditRef.current) { finishTextEdit(true); return; }
    const prev = historyRef.current.pop();
    if (!prev) return;
    objectsRef.current = prev;
    setSelected(null);
    markDirty();
    draw();
  }, [finishTextEdit, markDirty, draw]);

  const clearAll = useCallback(() => {
    if (!editableRef.current) return;
    if (!window.confirm("Clear the entire whiteboard?")) return;
    pushHistory();
    objectsRef.current = [];
    setSelected(null);
    markDirty();
    draw();
  }, [pushHistory, markDirty, draw]);

  const deleteSelected = useCallback(() => {
    if (!editableRef.current || !selectedRef.current) return;
    const list = [...(objectsRef.current || [])].filter((o) => o.id !== selectedRef.current);
    pushHistory();
    objectsRef.current = list;
    setSelected(null);
    markDirty();
    draw();
  }, [pushHistory, markDirty, draw]);

  const saveNow = useCallback(() => {
    if (!editableRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    dirtyRef.current = false;
    setSaveState("saving");
    onSave(JSON.parse(JSON.stringify(objectsRef.current || [])));
  }, [onSave]);

  useEffect(() => {
    const onKey = (e) => {
      if (textEditRef.current) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedRef.current) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected]);

  useEffect(() => {
    const onDblClick = (e) => {
      if (!editableRef.current) return;
      const { x, y } = logicalPos(e);
      const rev = [...(objectsRef.current || [])].reverse();
      const hit = rev.find((o) => o.kind === "text" && hitTest(o, x, y, canvasRef.current.getContext("2d")));
      if (hit) {
        e.preventDefault();
        setSelected(hit.id);
        setTextEdit({
          key: Date.now(),
          x: hit.x,
          y: hit.y,
          w: hit.w || 0,
          h: hit.h || 0,
          fontSize: hit.fontSize || 36,
          value: hit.text,
          editingId: hit.id,
        });
      }
    };
    canvasRef.current?.addEventListener("dblclick", onDblClick);
    return () => canvasRef.current?.removeEventListener("dblclick", onDblClick);
  }, [logicalPos]);

  const saveLabel = useMemo(() => {
    if (saveState === "saving") return t("wbSaving");
    if (saveState === "dirty") return t("wbUnsaved");
    if (saveState === "saved") return t("wbSaved");
    return "";
  }, [saveState, t]);

  const textOverlayStyle = useMemo(() => {
    if (!textEdit || !displayW) return {};
    const cssH = displayW * (H / W);
    return {
      left: `${(textEdit.x / W) * displayW}px`,
      top: `${(textEdit.y / H) * cssH}px`,
    };
  }, [textEdit, displayW]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-1">
          {TOOLS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              disabled={!editable}
              onClick={() => {
                setTool(id);
                if (textEditRef.current) finishTextEdit(false);
              }}
              title={id === "select" ? t("wbMoveTool") : id}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
                tool === id
                  ? "border-[#0E4B4C] bg-[#0E4B4C] text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              } ${!editable ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              disabled={!editable}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 transition cursor-pointer ${color === c ? "border-slate-800 scale-110" : "border-white shadow"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-1">
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              disabled={!editable}
              onClick={() => setStrokeWidth(w)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition cursor-pointer ${
                strokeWidth === w ? "border-[#0E4B4C] bg-[#0E4B4C]/5" : "border-slate-200 hover:bg-slate-50"
              }`}
              title={`${w}px`}
            >
              <span className="rounded-full bg-slate-700" style={{ width: `${w + 2}px`, height: `${w + 2}px` }} />
            </button>
          ))}
        </div>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <button
          type="button"
          disabled={!editable}
          onClick={undo}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
        >
          <Undo2 size={15} /> <span className="hidden sm:inline">{t("wbUndo")}</span>
        </button>
        <button
          type="button"
          disabled={!editable}
          onClick={clearAll}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-40"
        >
          <Eraser size={15} /> <span className="hidden sm:inline">{t("wbClear")}</span>
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <div className="ml-auto flex items-center gap-2">
          {saveLabel && (
            <span className="text-[11px] font-semibold text-slate-400">{saveLabel}</span>
          )}
          {editable ? (
            <button
              type="button"
              onClick={saveNow}
              disabled={!editable}
              className={`flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold text-white transition cursor-pointer ${
                saveState === "saving" ? "bg-slate-400" : "bg-[#0E4B4C] hover:bg-[#0b3b3c]"
              }`}
            >
              {saveState === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {t("wbSave")}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-500">
              <MousePointer2 size={13} /> {t("wbViewOnly")}
            </span>
          )}
        </div>
      </div>

      {editable && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500">
          {t("wbMoveHint")}
        </div>
      )}

      {!editable && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500">
          {t("wbViewOnlyHint")}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {(objects || []).length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <PenTool className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {editable ? t("wbEmpty") : t("wbEmptyView")}
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-400">
              {editable ? t("wbEmptyHint") : t("wbEmptyViewHint")}
            </p>
          </div>
        )}

        {typeof suggested === "number" && suggested > 0 && (
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("workflow-suggestions");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="absolute right-3 top-3 rounded-xl border border-[#0E4B4C]/15 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#0E4B4C] shadow-sm hover:bg-[#D7F5DE] transition cursor-pointer"
          >
            {suggested} suggestions
          </button>
        )}

        {textEdit && (
          <textarea
            autoFocus
            value={textEdit.value}
            onChange={(e) => {
              const val = e.target.value;
              const fs = textEdit.fontSize || 36;
              const { w: newW, h: newH } = computeTextMetrics(val, fs);
              setTextEdit((te) => ({ ...te, value: val, w: newW, h: newH }));
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Escape") { e.preventDefault(); finishTextEdit(true); }
            }}
            onBlur={() => finishTextEdit(false)}
            wrap="off"
            className="absolute z-10 wb-inline-text resize-none overflow-hidden whitespace-pre bg-transparent p-1 outline-none"
            style={{
              "--wb-inline-color": color,
              ...textOverlayStyle,
              width: `${Math.max(100, ((textEdit.w || 120) / W) * displayW)}px`,
              height: `${Math.max(30, ((textEdit.h || 46) / H) * (displayW * (H / W)))}px`,
              color,
              caretColor: color,
              fontSize: `${(textEdit.fontSize || 36) * (displayW / W)}px`,
              lineHeight: 1.28,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              border: "2px dashed",
              borderColor: color,
              borderRadius: 6,
              opacity: 0.92,
            }}
          />
        )}
      </div>
    </div>
  );
}