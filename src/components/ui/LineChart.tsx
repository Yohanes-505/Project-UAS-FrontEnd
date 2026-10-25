"use client";

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface ChartTip {
  time: string;
  value: string;
}

interface LineChartProps {
  main: Array<number | null>;
  comp: Array<number | null>;
  max: number;
  yTicks: Array<{ value: number; label: string }>;
  xLabels: Array<{ index: number; label: string }>;
  tipMain: (index: number) => ChartTip | null;
  tipComp: (index: number) => ChartTip | null;
  padLeft?: number;
  fallbackHeight?: number;
  ariaLabel?: string;
}

const PAD_R = 24;
const PAD_T = 24;
const PAD_B = 40;

export function LineChart({
  main,
  comp,
  max,
  yTicks,
  xLabels,
  tipMain,
  tipComp,
  padLeft = 56,
  fallbackHeight = 460,
  ariaLabel = "Grafik tren",
}: LineChartProps) {
  const gradId = `lcFill${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const mountRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const crossRef = useRef<SVGLineElement>(null);
  const dotMainRef = useRef<SVGCircleElement>(null);
  const dotCompRef = useRef<SVGCircleElement>(null);
  const lineMainRef = useRef<SVGPolylineElement>(null);
  const lineCompRef = useRef<SVGPolylineElement>(null);
  const tipMainRef = useRef<HTMLDivElement>(null);
  const tipCompRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hot, setHot] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(-1);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const measure = () => {
      const h = Math.round(el.clientHeight);
      setSize({ w: el.clientWidth || 900, h: h && h >= 80 ? h : fallbackHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallbackHeight]);

  const N = main.length;
  const W = size.w;
  const H = size.h;
  const plotW = W - padLeft - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const xFor = (i: number) => (N > 1 ? padLeft + (i / (N - 1)) * plotW : padLeft + plotW / 2);
  const yFor = (v: number) => PAD_T + (1 - v / max) * plotH;
  const live = useRef({ xFor, yFor, main, comp, W, H });
  live.current = { xFor, yFor, main, comp, W, H };

  const hover = useRef({ target: -1, active: false, raf: 0, x: 0, ym: 0, yc: 0 });

  const placeTip = (tip: HTMLDivElement | null, x: number, y: number) => {
    if (!tip) return;
    const { W: w, H: h } = live.current;
    let left = x + 16;
    if (left + tip.offsetWidth > w) left = x - 16 - tip.offsetWidth;
    const top = Math.max(4, Math.min(h - tip.offsetHeight - 4, y - tip.offsetHeight / 2));
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  };

  const paint = () => {
    const { x, ym, yc } = hover.current;
    crossRef.current?.setAttribute("x1", String(x));
    crossRef.current?.setAttribute("x2", String(x));
    dotMainRef.current?.setAttribute("cx", String(x));
    dotMainRef.current?.setAttribute("cy", String(ym));
    dotCompRef.current?.setAttribute("cx", String(x));
    dotCompRef.current?.setAttribute("cy", String(yc));
    placeTip(tipMainRef.current, x, ym);
    placeTip(tipCompRef.current, x, yc);
  };

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const targets = (i: number) => {
    const l = live.current;
    return { x: l.xFor(i), ym: l.yFor(l.main[i] ?? 0), yc: l.yFor(l.comp[i] ?? 0) };
  };

  const frame = () => {
    const h = hover.current;
    const t = targets(h.target);
    const k = 0.22;
    h.x += (t.x - h.x) * k;
    h.ym += (t.ym - h.ym) * k;
    h.yc += (t.yc - h.yc) * k;
    paint();
    const settled = Math.abs(t.x - h.x) < 0.4 && Math.abs(t.ym - h.ym) < 0.4 && Math.abs(t.yc - h.yc) < 0.4;
    h.raf = !settled && h.active ? requestAnimationFrame(frame) : 0;
  };

  const setIndex = (i: number) => {
    const h = hover.current;
    if (i === h.target) return;
    const first = h.target < 0;
    h.target = i;
    setHoverIdx(i);
    if (first || reduceMotion()) {
      Object.assign(h, targets(i));
      requestAnimationFrame(paint); 
      return;
    }
    if (!h.raf) h.raf = requestAnimationFrame(frame);
  };

  const indexFromEvent = (event: ReactPointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = (event.clientX - rect.left) * (W / rect.width);
    const i = Math.round(((px - padLeft) / plotW) * (N - 1));
    return Math.max(0, Math.min(N - 1, i));
  };

  const onMove = (event: ReactPointerEvent) => {
    hover.current.active = true;
    setHot(true);
    setIndex(indexFromEvent(event));
  };
  const onLeave = () => {
    const h = hover.current;
    h.active = false;
    setHot(false);
    if (h.raf) cancelAnimationFrame(h.raf);
    h.raf = 0;
  };
  useEffect(() => () => cancelAnimationFrame(hover.current.raf), []);

  const drawn = useRef(false);
  const ready = W > 0;
  useEffect(() => {
    if (!ready || drawn.current) return;
    drawn.current = true;
    const lineMain = lineMainRef.current;
    const lineComp = lineCompRef.current;
    if (!lineMain || !lineComp || reduceMotion()) return;
    const len = lineMain.getTotalLength();
    lineMain.style.strokeDasharray = String(len);
    lineMain.style.strokeDashoffset = String(len);
    lineMain.style.transition = "stroke-dashoffset 900ms var(--ease-out)";
    lineComp.style.opacity = "0";
    lineComp.style.transition = "opacity 600ms var(--ease-out) 250ms";
    const raf = requestAnimationFrame(() => {
      lineMain.style.strokeDashoffset = "0";
      lineComp.style.opacity = "1";
    });
    const timer = window.setTimeout(() => {
      lineMain.style.strokeDasharray = "none";
      lineMain.style.transition = "";
    }, 950);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [ready]);

  const pointsOf = (arr: Array<number | null>) =>
    arr.flatMap((v, i) => (v === null ? [] : [`${xFor(i)},${yFor(v)}`]));

  let body = null;
  if (ready) {
    const ptsMain = pointsOf(main);
    const ptsComp = pointsOf(comp);
    const firstIdx = main.findIndex((v) => v !== null);
    const lastIdx = main.length - 1 - [...main].reverse().findIndex((v) => v !== null);
    const area =
      ptsMain.length > 0
        ? `M ${ptsMain[0]} L ${ptsMain.join(" L ")} L ${xFor(lastIdx)},${yFor(0)} L ${xFor(firstIdx)},${yFor(0)} Z`
        : "";
    const tm = hoverIdx >= 0 ? tipMain(hoverIdx) : null;
    const tc = hoverIdx >= 0 ? tipComp(hoverIdx) : null;

    body = (
      <>
        <svg ref={svgRef} className="lc-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#111" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick.value}>
              <line className="lc-grid" x1={padLeft} y1={yFor(tick.value)} x2={W - PAD_R} y2={yFor(tick.value)} />
              <text className="lc-ylabel" x={padLeft - 12} y={yFor(tick.value) + 4} textAnchor="end">
                {tick.label}
              </text>
            </g>
          ))}
          {xLabels.map((label) => (
            <text key={label.index} className="lc-xlabel" x={xFor(label.index)} y={H - 14} textAnchor="middle">
              {label.label}
            </text>
          ))}

          {area && <path d={area} fill={`url(#${gradId})`} stroke="none" />}
          <polyline ref={lineCompRef} className="lc-line-comp" points={ptsComp.join(" ")} />
          <polyline ref={lineMainRef} className="lc-line-main" points={ptsMain.join(" ")} />

          <line ref={crossRef} className="lc-crosshair" x1={0} y1={PAD_T} x2={0} y2={H - PAD_B} />
          <circle ref={dotCompRef} className="lc-dot" r={4.5} fill="#8f8f8f" stroke="#fff" strokeWidth={2} />
          <circle ref={dotMainRef} className="lc-dot" r={4.5} fill="#111" stroke="#fff" strokeWidth={2} />

          <rect
            x={padLeft}
            y={PAD_T}
            width={plotW}
            height={plotH}
            fill="transparent"
            style={{ cursor: "crosshair" }}
            onPointerEnter={onMove}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
          />
        </svg>
        <div ref={tipMainRef} className="lc-tip lc-tip-main">
          {tm && (
            <>
              <div className="lc-tip-time">{tm.time}</div>
              <div className="lc-tip-val">{tm.value}</div>
            </>
          )}
        </div>
        <div ref={tipCompRef} className="lc-tip lc-tip-comp">
          {tc && (
            <>
              <div className="lc-tip-time">{tc.time}</div>
              <div className="lc-tip-val">{tc.value}</div>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`position-relative u-min-h-0 w-100 u-flex-1${hot ? " lc-hot" : ""}`}
    >
      {body}
    </div>
  );
}
