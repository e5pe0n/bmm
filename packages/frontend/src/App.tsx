import { useState } from "react";
import bmmLogo from "/succulents-svgrepo-com.svg";

function App() {
  return (
    <div className="p-8">
      <div className="flex space-x-2">
        <img className="w-12 h-12" src={bmmLogo} alt="bmm logo" />
        <h1 className="text-4xl font-bold">bmm</h1>
      </div>
      <h1>Vite + React</h1>
    </div>
  );
}

export default App;
