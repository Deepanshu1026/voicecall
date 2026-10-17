/**
 * Cleans blog content HTML that was pasted from Word / Outlook / Google Docs
 * before it is rendered, so the article looks consistent on the website.
 * Keeps real formatting (headings, bold, lists, links, images, embeds, tables)
 * and removes only junk.
 */
export const cleanPostHtml = (html) => {
  if (!html) return '';
  let out = String(html);

  // Comments / conditional comments
  out = out.replace(/<!--[\s\S]*?-->/g, '');

  // Word / Outlook namespace tags (invalid in HTML)
  out = out.replace(/<\/?o:p[^>]*>/gi, '');
  out = out.replace(/<\/?w:[^>]*>/gi, '');
  out = out.replace(/<\/?m:[^>]*>/gi, '');
  out = out.replace(/<\/?v:[^>]*>/gi, '');

  // Never render these from post content
  out = out.replace(/<meta[^>]*>/gi, '');
  out = out.replace(/<link[^>]*>/gi, '');
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Deprecated <font> wrapper -> keep its text
  out = out.replace(/<\/?font[^>]*>/gi, '');

  // Word paragraph classes
  out = out.replace(/\sclass="Mso[^"]*"/gi, '');
  out = out.replace(/\sclass='Mso[^']*'/gi, '');

  // Drop empty paragraphs and collapse runs of blank line-breaks (Word paste
  // inserts these between blocks, creating big gaps on the page).
  out = out.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
  out = out.replace(/(?:\s*<br\s*\/?>){2,}/gi, '<br />');
  out = out.replace(/(?:\s|&nbsp;)+<\/p>/gi, '</p>');

  // Headings must all render at one size — strip any inline font-size from
  // elements inside a heading (e.g. <b style="font-size:1.5rem">).
  out = out.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (_m, tag, attrs, inner) => {
    const cleanInner = inner.replace(/\sstyle="([^"]*)"/gi, (_mm, styles) => {
      const kept = styles
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((decl) => !/^font-size\s*:/i.test(decl));
      return kept.length ? ` style="${kept.join('; ')}"` : '';
    });
    return `<${tag}${attrs}>${cleanInner}</${tag}>`;
  });

  // Inline styles: drop Word-only declarations and stray blue colours,
  // keep the rest (text-align, font-weight, etc.).
  out = out.replace(/\sstyle="([^"]*)"/gi, (_m, styles) => {
    const kept = styles
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((decl) => !/^mso-/i.test(decl))
      .filter((decl) => !/\bcm2?\b/i.test(decl))
      .filter((decl) => !/^font-family\s*:/i.test(decl))
      .filter((decl) => !/^font-size\s*:[^;]*pt/i.test(decl))
      .filter((decl) => !/^color\s*:\s*(blue|#00f{1,3}|#0000ff|rgb\(\s*0\s*,\s*0\s*,\s*255)/i.test(decl));
    return kept.length ? ` style="${kept.join('; ')}"` : '';
  });

  return out.trim();
};

export default cleanPostHtml;
