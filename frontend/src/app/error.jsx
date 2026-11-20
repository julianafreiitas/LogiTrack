"use client";

import ErrorState from "./components/ErrorState";

export default function GlobalError({ reset }) {
  return <ErrorState reset={reset} />;
}
