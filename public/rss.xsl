<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f9fafb;
          }
          header {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            margin-bottom: 2rem;
            text-align: center;
          }
          h1 { margin: 0 0 0.5rem 0; }
          p.desc { color: #666; margin: 0; }
          .item {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            margin-bottom: 1.5rem;
            transition: transform 0.2s;
          }
          .item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .item h2 { margin: 0 0 0.5rem 0; }
          .item h2 a {
            color: #000;
            text-decoration: none;
          }
          .item h2 a:hover {
            text-decoration: underline;
            color: #2563eb;
          }
          .meta {
            font-size: 0.875rem;
            color: #888;
            margin-bottom: 1rem;
          }
          .content {
            color: #4b5563;
          }
          .banner {
            background: #fff0e6;
            border: 1px solid #ffdec2;
            color: #9a3412;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="banner">
          <strong>This is an RSS feed.</strong> Subscribe by copying the URL into your news reader.
        </div>
        <header>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
          <a href="{/rss/channel/link}" style="display:inline-block; margin-top:1rem; color:#2563eb; text-decoration:none;">Visit Website &#8594;</a>
        </header>
        <xsl:for-each select="/rss/channel/item">
          <div class="item">
            <h2>
              <a href="{link}" target="_blank">
                <xsl:value-of select="title"/>
              </a>
            </h2>
            <div class="meta">
              <xsl:value-of select="pubDate"/>
            </div>
            <div class="content">
               <xsl:value-of select="description" disable-output-escaping="yes"/>
            </div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
