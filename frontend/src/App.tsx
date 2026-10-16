import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppShell from "@/components/AppShell";
import DealAnalysis from "@/pages/DealAnalysis";
import Home from "@/pages/Home";
import PredictPrice from "@/pages/PredictPrice";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<PredictPrice />} />
          <Route path="/deal" element={<DealAnalysis />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
