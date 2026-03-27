import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout';
import { PageLoader } from './components/page-loader';
import { ThemeProvider } from './components/theme-provider';
import { TitleManager } from './components/title-manager';
import {
  Admin,
  Blog,
  BlogPost,
  Home,
  Links,
  Login,
  NotFound,
  PostEditor,
} from './route-components';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <TitleManager />
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="/links" element={<Links />} />
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/new" element={<PostEditor />} />
              <Route path="/admin/edit/:id" element={<PostEditor />} />

              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
