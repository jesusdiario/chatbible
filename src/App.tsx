import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import LivrosDaBiblia from "./pages/LivrosDaBiblia";
import LivrosDaBibliaBook from "./pages/LivrosDaBibliaBook";
import Admin from "./pages/Admin";
import AdminBooks from "./pages/AdminBooks";
import AdminPages from "./pages/AdminPages";
import AdminCategories from "./pages/AdminCategories";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LivrosDaBiblia />,
  },
  {
    path: "/livros-da-biblia",
    element: <LivrosDaBiblia />,
  },
  {
    path: "/livros-da-biblia/:bookSlug",
    element: <LivrosDaBibliaBook />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/admin/livros",
    element: <AdminBooks />,
  },
  {
    path: "/admin/paginas",
    element: <AdminPages />,
  },
  {
    path: "/admin/categorias",
    element: <AdminCategories />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
