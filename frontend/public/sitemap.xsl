<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  exclude-result-prefixes="s image">

  <xsl:output method="html" indent="yes" encoding="UTF-8" doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>XML Sitemap - A Visa Experts</title>
        <style>
          body { margin: 0; padding: 32px 20px 60px; background: #f6f7f9;
                 font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1f2937; }
          .wrap { max-width: 1180px; margin: 0 auto; }
          .brand { display: inline-block; margin-bottom: 18px; font-size: 13px; font-weight: 700;
                   letter-spacing: .08em; text-transform: uppercase; color: #4f46e5; }
          h1 { margin: 0 0 10px; font-size: 28px; color: #111827; }
          p.intro { margin: 0 0 6px; font-size: 15px; line-height: 1.6; color: #4b5563; max-width: 780px; }
          p.count { margin: 18px 0 12px; font-size: 15px; color: #111827; }
          p.count strong { font-weight: 700; }
          .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;
                  box-shadow: 0 1px 3px rgba(16,24,40,.06); }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th { text-align: left; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;
               font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: #6b7280; white-space: nowrap; }
          td { padding: 11px 16px; border-bottom: 1px solid #f1f2f4; vertical-align: top; word-break: break-all; }
          tr:last-child td { border-bottom: 0; }
          tr:hover td { background: #fafbff; }
          a { color: #1a56db; text-decoration: none; }
          a:hover { text-decoration: underline; }
          td.num { text-align: center; color: #6b7280; width: 70px; }
          td.date { white-space: nowrap; color: #6b7280; width: 190px; }
          .foot { margin-top: 22px; font-size: 13px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <span class="brand">A Visa Experts</span>
          <h1>XML Sitemap</h1>
          <p class="intro">
            This file is for search engines, not visitors. It is safe to share the link -
            opening it here just shows a readable list of the pages it contains.
          </p>
          <p class="intro">
            Learn more about XML sitemaps at
            <a href="https://www.sitemaps.org/" target="_blank" rel="noopener">sitemaps.org</a>.
          </p>

          <xsl:choose>
            <!-- ===== Sitemap index: a list of the sitemap files ===== -->
            <xsl:when test="s:sitemapindex">
              <p class="count">
                This XML Sitemap Index file contains
                <strong><xsl:value-of select="count(s:sitemap)"/></strong> sitemaps.
              </p>
              <div class="card">
                <table>
                  <thead>
                    <tr>
                      <th>Sitemap</th>
                      <th>Last Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="s:sitemap">
                      <xsl:sort select="s:loc"/>
                      <tr>
                        <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                        <td class="date"><xsl:value-of select="s:lastmod"/></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:when>

            <!-- ===== URL set: every page in this sitemap ===== -->
            <xsl:otherwise>
              <p class="count">
                This XML Sitemap contains
                <strong><xsl:value-of select="count(s:url)"/></strong> URLs.
              </p>
              <div class="card">
                <table>
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th>Images</th>
                      <th>Last Mod.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="s:url">
                      <xsl:sort select="s:loc"/>
                      <tr>
                        <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                        <td class="num"><xsl:value-of select="count(image:image)"/></td>
                        <td class="date"><xsl:value-of select="s:lastmod"/></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:otherwise>
          </xsl:choose>

          <p class="foot">Generated for avisaexperts.com</p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
