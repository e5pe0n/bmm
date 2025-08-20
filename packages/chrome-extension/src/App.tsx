import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Popup from "./Popup";

function App() {
  return (
    <div className="p-3">
      <h1 className="text-lg">bmm</h1>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Suspense fallback={<p>loading...</p>}>
          <Popup />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
