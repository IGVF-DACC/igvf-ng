"use client";

// node_modules
import React, { useState } from "react";
// components
import { JsonDisplay } from "@/components/json-display";
// root
import { type DatabaseObject } from "@/globals.d";

interface ObjectJsonStaticProps {
  object: DatabaseObject;
  children: React.ReactNode;
}

export function ObjectJsonStatic({ object, children }: ObjectJsonStaticProps) {
  const [isJsonVisible, setIsJsonVisible] = useState(false);
  console.log("JSON VISIBILITY STATIC *****", isJsonVisible);

  return (
    <div>
      <button
        className="rounded border border-black px-2 text-sm"
        onClick={() => setIsJsonVisible(!isJsonVisible)}
      >
        {isJsonVisible ? "Hide" : "Show"} JSON
      </button>
      {isJsonVisible && children}
    </div>
  );
}
