'use client';

import { useMemo, useRef, useState } from 'react';
import type { StreakPoint } from '@/lib/stats';

interface StreakTrendChartProps {
  data: StreakPoint[];
}

const VIEW_W = 600;
const VIEW_H = 200;
const PAD_LEFT = 28;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
}

export default function StreakTrendChart({ data }: StreakTrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const lastIndex = data.length - 1;

  const { xScale, yScale, niceMax, points } = useMemo(() => {
    const maxStreak = Math.max(1, ...data.map((d) => d.streak));
    const niceMax = maxStreak <= 4 ? 4 : Math.ceil(maxStreak / 5) * 5;

    const plotW = VIEW_W - PAD_LEFT - PAD_RIGHT;
    const plotH = VIEW_H - PAD_TOP - PAD_BOTTOM;

    const xScale = (i: number) =>
      lastIndex <= 0 ? PAD_LEFT + plotW / 2 : PAD_LEFT + (i / lastIndex) * plotW;
    const yScale = (v: number) => PAD_TOP + plotH - (v / niceMax) * plotH;

    const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.streak) }));

    return { xScale, yScale, niceMax, points };
  }, [data, lastIndex]);

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-text">Todavía no hay suficiente historial para graficar la racha</p>
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const baselineY = yScale(0);
  const areaPath = `${linePath} L${points[lastIndex].x},${baselineY} L${points[0].x},${baselineY} Z`;

  const tickIndices = (() => {
    const count = Math.min(5, data.length);
    if (count <= 1) return [0];
    const step = lastIndex / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(i * step));
  })();

  const updateActiveFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const viewX = ratio * VIEW_W;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - viewX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setActiveIndex(nearest);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(lastIndex, (prev ?? lastIndex) + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(0, (prev ?? lastIndex) - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(lastIndex);
    }
  };

  const active = activeIndex !== null ? data[activeIndex] : null;
  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const lastPoint = points[lastIndex];

  return (
    <div className="streak-chart">
      <div
        className="streak-chart-plot"
        onPointerLeave={() => setActiveIndex(null)}
        onFocus={() => setActiveIndex((prev) => prev ?? lastIndex)}
        onBlur={() => setActiveIndex(null)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="img"
        aria-label={`Evolución de la racha, valor actual ${data[lastIndex].streak} días`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="streak-chart-svg"
          onPointerMove={(e) => updateActiveFromClientX(e.clientX)}
        >
          {/* Gridlines */}
          {[0, niceMax / 2, niceMax].map((v) => (
            <g key={v}>
              <line
                x1={PAD_LEFT}
                x2={VIEW_W - PAD_RIGHT}
                y1={yScale(v)}
                y2={yScale(v)}
                className="streak-chart-gridline"
              />
              <text x={4} y={yScale(v) + 4} className="streak-chart-axis-label">
                {Math.round(v)}
              </text>
            </g>
          ))}

          {/* Area + line */}
          <path d={areaPath} className="streak-chart-area" />
          <path d={linePath} className="streak-chart-line" />

          {/* X axis ticks */}
          {tickIndices.map((i) => (
            <text
              key={i}
              x={points[i].x}
              y={VIEW_H - 6}
              textAnchor={i === 0 ? 'start' : i === lastIndex ? 'end' : 'middle'}
              className="streak-chart-axis-label"
            >
              {formatShortDate(data[i].date)}
            </text>
          ))}

          {/* Crosshair + hovered point */}
          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={PAD_TOP}
                y2={baselineY}
                className="streak-chart-crosshair"
              />
              <circle cx={activePoint.x} cy={activePoint.y} r={5} className="streak-chart-dot" />
            </>
          )}

          {/* Punto final siempre visible, con etiqueta directa */}
          <circle cx={lastPoint.x} cy={lastPoint.y} r={5} className="streak-chart-dot" />
        </svg>

        {active && activePoint && (
          <div
            className="streak-chart-tooltip"
            style={{
              left: `${(activePoint.x / VIEW_W) * 100}%`,
              top: `${(activePoint.y / VIEW_H) * 100}%`,
            }}
          >
            <strong>{active.streak} {active.streak === 1 ? 'día' : 'días'}</strong>
            <span>{formatShortDate(active.date)}</span>
          </div>
        )}
      </div>

      <details className="streak-chart-table-toggle">
        <summary>Ver como tabla</summary>
        <div className="streak-chart-table-wrap">
          <table className="streak-chart-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Racha</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{formatShortDate(d.date)}</td>
                  <td>{d.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
