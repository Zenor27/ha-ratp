import "@mantine/core/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import { Metros } from "./pages/Metros";
import { Buses } from "./pages/Buses";

const theme = createTheme({});

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Metros />,
  },
  {
    path: "/buses",
    element: <Buses />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <QueryClientProvider client={queryClient}>
        <div
          style={{
            width: "100vw",
            height: "100vh",
          }}
        >
          <RouterProvider router={router} />
        </div>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>
);
