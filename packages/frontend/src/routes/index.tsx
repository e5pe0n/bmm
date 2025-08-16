import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Bookmarks from "./-components/Bookmarks";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <Suspense fallback={<div>Loading bookmarks...</div>}>
        <Bookmarks />
      </Suspense>
    </ErrorBoundary>
  );
}
