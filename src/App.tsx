
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/Layout";
import AuthWrapper from "@/components/AuthWrapper";
import Test from "@/pages/Test";
import FlowManager from "@/components/FlowManager";
import LeadsTable from "@/components/LeadsTable";
import Settings from "@/pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/404" element={<NotFound />} />
          <Route element={<AuthWrapper><Layout /></AuthWrapper>}>
            <Route path="/" element={<Index />} />
            <Route path="/flows" element={<FlowManager />} />
            <Route path="/leads" element={<LeadsTable />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/test" element={<Test />} />
          </Route>
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
