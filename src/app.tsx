import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { ThemeProvider } from './components/theme-provider';
import { FontLoader } from './components/font-loader';
import { TitleManager } from './components/title-manager';
import Home from './pages/home';
import Blog from './pages/blog';
import BlogPost from './pages/blog-post';
import Links from './pages/links';
import Login from './pages/login';
import Admin from './pages/admin';
import PostEditor from './pages/post-editor';
import RssFeed from './pages/rss';

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
            <Route path="/rss" element={<RssFeed />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/new" element={<PostEditor />} />
            <Route path="/admin/edit/:id" element={<PostEditor />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
