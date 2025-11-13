import { useState } from "react";
import reactLogo from "@ui/assets/react.svg";
import { ThemeToggle } from "@ui/components/theme/theme-toggle";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex gap-8">
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="h-24 p-6 drop-shadow-[0_0_1em_#61dafbaa] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[spin_20s_linear_infinite]"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-4xl font-bold mb-4">Vite + React</h1>
      <div className="p-8 rounded-lg border border-border bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          count is {count}
        </button>
        <p className="mt-4 text-muted-foreground">
          Edit{" "}
          <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">
            src/App.tsx
          </code>{" "}
          and save to test HMR
        </p>
      </div>
      <p className="text-muted-foreground text-sm mt-4">
        Click on the Vite and React dfg;kljndfligkjbn
      </p>
    </div>
  );
}

export default App;
