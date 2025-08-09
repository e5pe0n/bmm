import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Bookmarks from "./components/Bookmarks";
import bmmLogo from "/succulents-svgrepo-com.svg";

function App() {
  return (
    <div className="p-8">
      <div className="flex space-x-2">
        <img className="w-12 h-12" src={bmmLogo} alt="bmm logo" />
        <h1 className="text-4xl font-bold">bmm</h1>
      </div>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <Suspense fallback={<div>Loading bookmarks...</div>}>
          <Bookmarks />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
