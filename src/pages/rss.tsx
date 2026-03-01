import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RssFeed() {
  const [xml, setXml] = useState('');

  useEffect(() => {
    async function generateRss() {
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      const baseUrl = window.location.origin;
      const date = new Date().toUTCString();

      const items = posts?.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${post.content.slice(0, 200)}...]]></description>
    </item>`).join('') || '';

      const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>My Blog</title>
    <link>${baseUrl}</link>
    <description>My Personal Blog</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`;

      setXml(rss);
    }

    generateRss();
  }, []);

  return (
    <div className="p-4 font-mono text-xs whitespace-pre-wrap break-all bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen">
      {xml}
    </div>
  );
}
