import { RouterProvider } from "react-router-dom";
import "./App.css";
import { appRouter } from "./routes/routes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      {/* GLOBAL TOASTER – visible on every route */}
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 3000,

          // DEFAULT STYLE
          style: {
            fontFamily: "Calibri",
            background: "white",
            color: "#1a1a1a",
             zIndex: "999999",
            fontSize: "15px",
            marginTop: "50px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e0e5eb",
            boxShadow:
              "0px 6px 16px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.04)",
          },

          // SUCCESS STYLE
          success: {
            iconTheme: {
              primary: "#4CAF50",
              secondary: "#fff",
            },
            style: {
              borderLeft: "6px solid #4CAF50",
            },
          },

          // ERROR STYLE
          error: {
            iconTheme: {
              primary: "#E53935",
              secondary: "#fff",
            },
            style: {
              borderLeft: "6px solid #E53935",
            },
          },

          // LOADING STYLE
          loading: {
            style: {
              borderLeft: "6px solid #10407E",
            },
          },
        }}
      />

      {/* ROUTER */}
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;
