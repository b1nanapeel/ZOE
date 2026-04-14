"use client";

import { useState } from "react";
import type { ContextMatrix } from "@/lib/patterns";
import { PatternEmpty } from "./EmptyState";

type Source = "antecedents" | "location";

export function ContextHeatmap({
  matrices,
}: {
  matrices: { antecedents: ContextMatrix; location: ContextMatrix };
}) {
  const [source, setSource] = useState<Source>("antecedents");
  const matrix = matrices[source];

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5">
        {(
          [
            { id: "antecedents", label: "Antecedent" },
            { id: "location", label: "Location" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSource(opt.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              source === opt.id
                ? "bg-primary-500 text-white"
                : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {matrix.behaviors.length === 0 || matrix.contexts.length === 0 ? (
        <PatternEmpty message="Tag context on more clips to see how behaviors cluster." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-100 bg-white">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white p-2 text-left font-medium text-neutral-500" />
                {matrix.contexts.map((ctx) => (
                  <th
                    key={ctx}
                    className="p-2 text-left font-medium text-neutral-500 whitespace-nowrap"
                  >
                    {ctx}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.behaviors.map((b) => (
                <tr key={b} className="border-t border-neutral-100">
                  <td className="sticky left-0 z-10 bg-white p-2 font-medium text-neutral-700 whitespace-nowrap">
                    {b}
                  </td>
                  {matrix.contexts.map((ctx) => {
                    const cell = matrix.cells.find(
                      (c) => c.behavior === b && c.context === ctx,
                    );
                    const pct = cell?.percentage ?? 0;
                    const intensity = Math.min(pct / 100, 1);
                    return (
                      <td key={ctx} className="p-1">
                        <div
                          className="flex h-12 w-16 flex-col items-center justify-center rounded text-[10px]"
                          style={{
                            background: `rgba(34, 197, 94, ${0.08 + intensity * 0.55})`,
                            color: intensity > 0.5 ? "#0f3a1e" : "#44403c",
                          }}
                          title={`${pct}% (${cell?.count ?? 0} clips)`}
                        >
                          <span className="font-mono font-semibold">{pct}%</span>
                          <span className="text-neutral-500">
                            {cell?.count ?? 0}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
