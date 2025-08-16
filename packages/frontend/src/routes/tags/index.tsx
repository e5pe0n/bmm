import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Tags from "./-components/Tags";

export const Route = createFileRoute("/tags/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <Suspense fallback={<div>Loading bookmarks...</div>}>
        <Tags />
      </Suspense>
    </ErrorBoundary>
  );
}
