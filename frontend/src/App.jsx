import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GeneratorDetails from "./pages/GeneratorDetails";
import AddGeneratorDetails from "./pages/AddGeneratorDetails";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/generator/:id"
          element={
            <PrivateRoute>
              <GeneratorDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-generator"
          element={
            <PrivateRoute>
              <AddGeneratorDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
