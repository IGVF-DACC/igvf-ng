"use client";

// node_modules
import React, { useState } from "react";
// components
import { JsonDisplay } from "@/components/json-display";
// root
import { type DatabaseObject } from "@/globals.d";

export function ObjectJson({ object }: { object: DatabaseObject }) {
  const [isJsonVisible, setIsJsonVisible] = useState(false);
  console.log("JSON VISIBILITY *****", isJsonVisible);

  return (
    <div>
      <button
        className="rounded border border-black px-2 text-sm"
        onClick={() => setIsJsonVisible(!isJsonVisible)}
      >
        {isJsonVisible ? "Hide" : "Show"} JSON
      </button>
      <JsonDisplay object={object} isVisible={isJsonVisible} />
    </div>
  );
}
