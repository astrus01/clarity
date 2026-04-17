"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";

interface Product {
  name: string;
  description?: string;
  rating?: number;
  price?: string;
  pros?: string[];
  cons?: string[];
  features: Record<string, boolean | string>;
}

interface ComparisonTableCardProps {
  products: Product[];
  criteria?: string[];
  highlightBest?: boolean;
}

export function ComparisonTableCard({
  products,
  criteria = [],
  highlightBest = true,
}: ComparisonTableCardProps) {
  // Derive criteria from products if not provided
  const allCriteria =
    criteria.length > 0
      ? criteria
      : Array.from(
          new Set(products.flatMap((p) => Object.keys(p.features)))
        );

  const getBestFeature = (criteria: string) => {
    // Simple heuristic: if feature value is boolean true, count it. For numeric, compare.
    // For simplicity, we'll just return first product with true
    return products.find((p) => p.features[criteria] === true);
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40 overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Side-by-side analysis of options
        </p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-3 font-semibold text-muted-foreground">
                  Feature
                </th>
                {products.map((product, idx) => (
                  <th key={idx} className="text-left p-3 font-semibold min-w-[150px]">
                    <div className="flex flex-col gap-1">
                      <span>{product.name}</span>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs text-muted-foreground">
                            {product.rating}
                          </span>
                        </div>
                      )}
                      {product.price && (
                        <span className="text-xs text-muted-foreground">
                          {product.price}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allCriteria.map((criterion) => {
                const best = highlightBest ? getBestFeature(criterion) : null;

                return (
                  <tr key={criterion} className="border-b border-border/20">
                    <td className="p-3 font-medium text-muted-foreground">
                      {criterion}
                    </td>
                    {products.map((product, pIdx) => {
                      const value = product.features[criterion];
                      const isBest = highlightBest && best === product;
                      const cellClass = isBest
                        ? "bg-primary/10"
                        : "";

                      return (
                        <td
                          key={pIdx}
                          className={`p-3 text-center ${cellClass}`}
                        >
                          {value === true ? (
                            <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                          ) : value === false ? (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          ) : (
                            <span className="text-xs">{String(value)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pros/Cons summaries */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {products.map((product, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-muted/20">
              <div className="font-medium mb-2">{product.name}</div>
              {product.pros && product.pros.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-emerald-500 mb-1">
                    Pros
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {product.pros.slice(0, 2).map((pro, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {product.cons && product.cons.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-500 mb-1">
                    Cons
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {product.cons.slice(0, 2).map((con, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
