import { Theme } from "./settings/types";
import { PulmonaryFormularyDashboard } from "./components/generated/PulmonaryFormularyDashboard";

let theme: Theme = "light";

function App() {
  function setTheme(theme: Theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  setTheme(theme);

  return (
    <>
      <PulmonaryFormularyDashboard />
    </>
  );
  // %EXPORT_STATEMENT%
}

export default App;
