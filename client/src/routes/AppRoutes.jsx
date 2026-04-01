import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '../layouts/Layout'
import Home from '../pages/Home'
import Novel from '../pages/Novel'
import Chapter from '../pages/Chapter'
import Category from '../pages/Category'
import CategorySearch from '../pages/CategorySearch'
import Profile from '../pages/Profile'
import Writer from '../pages/Writer'
import Follow from '../pages/Follow'
import Search from '../pages/Search'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import LayoutWriter from '../layouts/LayoutWriter'
import DashboardWriter from '../pages/writer/DashboardWriter'
import MyNovel from '../pages/writer/MyNovel'
import MyNovelDetail from '../pages/writer/MyNovelDetail'
import LayoutAdmin from '../layouts/LayoutAdmin'
import Dashboard from '../pages/admin/Dashboard'
import ManageUser from '../pages/admin/ManageUser'
import ManageCategory from '../pages/admin/ManageCategory'
import ManageNovel from '../pages/admin/ManageNovel'
import ManageMyNovel from '../pages/admin/ManageMyNovel'
import ManageMyNovelDetail from '../pages/admin/ManageMyNovelDetail'
import ManageBanner from '../pages/admin/ManageBanner'
import NotFound from '../pages/NotFound'
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "novel/:id", element: <Novel /> },
      { path: "novel/:id/chapter/:chapterNumber", element: <Chapter /> },
      { path: "category", element: <Category /> },
      { path: "category/:categoryId", element: <CategorySearch /> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "follow", element: <ProtectedRoute><Follow /></ProtectedRoute> },
      { path: "writer/:writerId", element: <Writer /> },
      { path: "search", element: <Search /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/writer",
    element: <ProtectedRoute allowedRoles={["writer"]} />,
    children: [
      {
        element: <LayoutWriter />,
        children: [
          { index: true, element: <DashboardWriter /> },
          { path: "mynovel", element: <MyNovel /> },
          { path: "mynovel/:id", element: <MyNovelDetail /> },

        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <LayoutAdmin />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "novel", element: <ManageNovel /> },
          { path: "category", element: <ManageCategory /> },
          { path: "user", element: <ManageUser /> },
          { path: "mynovel", element: <ManageMyNovel /> },
          { path: "mynovel/:id", element: <ManageMyNovelDetail /> },
          { path: "banner", element: <ManageBanner /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> }
  ,
]
  // , {
  //   basename: "/661463035/novel",
  // }
);

const AppRoutes = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default AppRoutes