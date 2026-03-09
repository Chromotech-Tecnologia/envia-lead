
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
import SuperAdmin from "@/pages/SuperAdmin";
import { AdminViewProvider } from "@/contexts/AdminViewContext";

function App() {
  return (
    <BrowserRouter>
      <AdminViewProvider>
        <div className="min-h-screen bg-gray-50">
          <AuthWrapper>
            <Routes>
              <Route path="/404" element={<NotFound />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/flows" element={<FlowManager />} />
                <Route path="/leads" element={<LeadsTable />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<SuperAdmin />} />
                <Route path="/test" element={<Test />} />
              </Route>
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AuthWrapper>
        </div>
      </AdminViewProvider>
    </BrowserRouter>
  );
}

export default App;
