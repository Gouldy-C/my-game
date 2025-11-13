import { ThemeToggle } from "@ui/components/theme/theme-toggle";
import { Canvas } from "@renderer/Canvas";

function App() {
  return (
    <div className="relative w-full h-screen bg-background">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <Canvas className="w-full h-full" />
    </div>
  );
}

export default App;
