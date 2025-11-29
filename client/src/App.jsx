import { RouterProvider } from "react-router-dom";
import "./App.css";
import Layout from "./Layout/Layout";
import { appRouter } from "./routes/routes";

function App() {
  return (
    <RouterProvider router={appRouter}>
      <Layout />
    </RouterProvider>
  );
}

export default App;
