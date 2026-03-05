import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { FontLoader } from './components/font-loader';
import { Layout } from './components/layout';
import { ThemeProvider } from './components/theme-provider';
import { TitleManager } from './components/title-manager';
import Admin from './pages/admin';
import Blog from './pages/blog';
import BlogPost from './pages/blog-post';
import Home from './pages/home';
import Links from './pages/links';
import Login from './pages/login';
import NotFound from './pages/not-found';
import PostEditor from './pages/post-editor';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <FontLoader />
      <BrowserRouter>
        <TitleManager />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/links" element={<Links />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/new" element={<PostEditor />} />
            <Route path="/admin/edit/:id" element={<PostEditor />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
