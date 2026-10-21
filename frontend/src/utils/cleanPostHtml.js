/**
 * Cleans blog content HTML that was pasted from Word / Outlook / Google Docs /
 * rich editors or loaded from legacy databases, transforming it into pristine,
 * structured semantic HTML with real headings (<h2>, <h3>) and lists (<ul>, <ol>).
 *
 * This ensures content is effortless and delightful for normal readers:
 * - Proper visual hierarchy with chapters and subsections
 * - Functional Table of Contents generation
 * - Semantic bullet lists instead of broken raw symbol paragraphs
 * - Clean typography without conflicting pasted inline styles
 */
export const cleanPostHtml = (html) => {
  if (!html) return '';
  let out = String(html);

  // 1. Comments & invalid namespace tags
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/<\/?o:p[^>]*>/gi, '');
  out = out.replace(/<\/?w:[^>]*>/gi, '');
  out = out.replace(/<\/?m:[^>]*>/gi, '');
  out = out.replace(/<\/?v:[^>]*>/gi, '');

  // 2. Dangerous or layout-breaking tags
  out = out.replace(/<meta[^>]*>/gi, '');
  out = out.replace(/<link[^>]*>/gi, '');
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<\/?font[^>]*>/gi, '');
  out = out.replace(/\sclass="Mso[^"]*"/gi, '');
  out = out.replace(/\sclass='Mso[^']*'/gi, '');

  // 3. Fix malformed protocol links
  out = out.replace(/href=":\/\//gi, 'href="https://');
  out = out.replace(/href=':\/\//gi, "href='https://");
  out = out.replace(/href="A\s*Visa\s*Experts"/gi, 'href="https://avisaexperts.com"');
  out = out.replace(/href='A\s*Visa\s*Experts'/gi, "href='https://avisaexperts.com'");
  out = out.replace(/href="AvisaExperts\.com"/gi, 'href="https://avisaexperts.com"');
  out = out.replace(/href='AvisaExperts\.com'/gi, "href='https://avisaexperts.com'");

  // 4. Strip distracting / inconsistent inline styles
  out = out.replace(/\sstyle="([^"]*)"/gi, (_m, styles) => {
    const kept = styles
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((decl) => !/^mso-/i.test(decl))
      .filter((decl) => !/\bcm2?\b/i.test(decl))
      .filter((decl) => !/^font-family\s*:/i.test(decl))
      .filter((decl) => !/^font-size\s*:/i.test(decl))
      .filter((decl) => !/^line-height\s*:/i.test(decl))
      .filter((decl) => !/^letter-spacing\s*:/i.test(decl))
      .filter((decl) => !/^background(-color)?\s*:\s*(#fff(fff)?|white|transparent|yellow|#ff0|#ffff00|rgb\(\s*255\s*,\s*255\s*,\s*0\s*\)|rgba\(\s*255\s*,\s*255\s*,\s*255\s*(?:,\s*[\d\.]+\s*)?\)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/i.test(decl))
      .filter((decl) => !/^color\s*:\s*(#000(000)?|#111|#222|#333|#334155|#1f2937|black|blue|#00f{1,3}|#0000ff|rgb\(\s*(?:0|51)\s*,\s*(?:0|51)\s*,\s*(?:0|51|255)\s*\))/i.test(decl));
    return kept.length ? ` style="${kept.join('; ')}"` : '';
  });

  // Unwrap plain <span> with no attributes
  out = out.replace(/<span>([\s\S]*?)<\/span>/gi, '$1');

  // 5. Clean empty paragraphs & multiple line breaks
  out = out.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
  out = out.replace(/<h[1-6][^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/h[1-6]>/gi, '');
  out = out.replace(/(?:\s*<br\s*\/?>){2,}/gi, '<br />');

  // 6. Convert pseudo-headings starting with symbols (➤, ►, 👉, ✦, 📌)
  // Case 1: Arrow then <strong>Title</strong> (e.g. <p>➤ <strong>Title: </strong>Body...</p>)
  out = out.replace(/<p[^>]*>(?:\s*<span[^>]*>)?\s*[➤►👉✦📌]\s*(?:<\/span>)?\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*:?\s*([\s\S]*?)<\/p>/gi, (_m, rawTitle, rawBody) => {
    const textTitle = rawTitle.replace(/<[^>]+>/g, '').replace(/[:\.\s]+$/, '').trim();
    if (textTitle && textTitle.length >= 3 && textTitle.length <= 110) {
      let res = `<h2>${textTitle}</h2>`;
      const body = (rawBody || '').trim();
      if (body && body !== '&nbsp;' && body !== '<br>' && body !== '<br/>') {
        res += `<p>${body}</p>`;
      }
      return res;
    }
    return _m;
  });

  // Case 2: <strong> enclosing arrow and title (e.g. <p><strong>➤ Title: </strong>Body...</p>)
  out = out.replace(/<p[^>]*>(?:\s*<span[^>]*>)?\s*<strong[^>]*>\s*[➤►👉✦📌]\s*([\s\S]*?)<\/strong>\s*:?\s*([\s\S]*?)<\/p>/gi, (_m, rawTitle, rawBody) => {
    const textTitle = rawTitle.replace(/<[^>]+>/g, '').replace(/[:\.\s]+$/, '').trim();
    if (textTitle && textTitle.length >= 3 && textTitle.length <= 110) {
      let res = `<h2>${textTitle}</h2>`;
      const body = (rawBody || '').trim();
      if (body && body !== '&nbsp;' && body !== '<br>' && body !== '<br/>') {
        res += `<p>${body}</p>`;
      }
      return res;
    }
    return _m;
  });

  // Case 3: Paragraph starting with strong title separated by newline or <br> (e.g. <p><strong>What is a Europe Work Visa</strong>\r\nA Europe Work Visa...</p>)
  out = out.replace(/<p[^>]*>\s*<strong[^>]*>([A-Z0-9][^<]{3,80}?)<\/strong>(?::)?(?:\s*<br\s*\/?>|\r?\n)+([\s\S]*?)<\/p>/gi, (_m, rawTitle, rawBody) => {
    const textTitle = rawTitle.replace(/<[^>]+>/g, '').replace(/[:\.\s]+$/, '').trim();
    if (textTitle && textTitle.length >= 3 && textTitle.length <= 90 && !textTitle.includes('.')) {
      let res = `<h2>${textTitle}</h2>`;
      const body = (rawBody || '').trim();
      if (body) res += `<p>${body}</p>`;
      return res;
    }
    return _m;
  });

  // Case 4: Non-bold arrow questions or titles ending with colon or question mark
  out = out.replace(/<p[^>]*>(?:\s*<span[^>]*>)?\s*[➤►👉✦📌]\s*(?:<\/span>)?\s*([^<]{4,85}?(?::|\?))\s*<\/p>/gi, (_m, rawTitle) => {
    const title = rawTitle.replace(/[:\.\s]+$/, '').trim();
    return title ? `<h2>${title}</h2>` : _m;
  });

  // 7. Standalone questions as <h2>: e.g. <p>What is a Canadian Tourist Visa?</p>
  out = out.replace(/<p[^>]*>\s*([A-Z0-9][^<]{4,85}\?)\s*<\/p>/g, (_m, q) => {
    return `<h2>${q.trim()}</h2>`;
  });

  // 8. Standalone numbered section titles as <h3>: e.g. <p>1. Strong Ties to Your Home Country</p>
  out = out.replace(/<p[^>]*>\s*(?:<strong[^>]*>)?\s*(\d+\.\s+[A-Z][^<]{3,80}?)(?::)?\s*(?:<\/strong>)?\s*<\/p>/g, (_m, title) => {
    return `<h3>${title.trim()}</h3>`;
  });

  // 9. Convert consecutive pseudo-bullet paragraphs to <ul><li>...</li></ul>
  // Match paragraphs starting with bullet markers: •, &bull;, \u2022, -, –
  out = out.replace(/(?:<p[^>]*>(?:\s*<span[^>]*>)?\s*(?:&bull;|[•\u2022\u25cf\u25cb\u25aa\u25ab\u2013\u2014–—]|\-(?=\s+))\s*(?:<\/span>)?\s*[\s\S]*?<\/p>\s*)+/gi, (match) => {
    const items = [];
    let m;
    const re = /<p[^>]*>(?:\s*<span[^>]*>)?\s*(?:&bull;|[•\u2022\u25cf\u25cb\u25aa\u25ab\u2013\u2014–—]|\-(?=\s+))\s*(?:<\/span>)?\s*([\s\S]*?)<\/p>/gi;
    while ((m = re.exec(match)) !== null) {
      const itemContent = m[1].trim();
      if (itemContent) {
        items.push(`<li>${itemContent}</li>`);
      }
    }
    return items.length ? `<ul>${items.join('')}</ul>` : match;
  });

  // 10. Clean Quill editor artifacts
  out = out.replace(/<span class="ql-ui"[^>]*><\/span>/gi, '');
  // Quill bullet list inside <ol>
  out = out.replace(/<ol[^>]*>((?:\s*<li[^>]*data-list="bullet"[^>]*>[\s\S]*?<\/li>\s*)+)<\/ol>/gi, (_m, inner) => {
    const cleanItems = inner.replace(/\s*data-list="bullet"/gi, '');
    return `<ul>${cleanItems}</ul>`;
  });

  // 11. Normalize headings: if the post has <h3> but zero <h2>, promote <h3> to <h2> and <h4> to <h3>
  if (!/<h2[\s>]/i.test(out) && /<h3[\s>]/i.test(out)) {
    out = out.replace(/<h4(\s[^>]*)?>/gi, '<h3$1>').replace(/<\/h4>/gi, '</h3>');
    out = out.replace(/<h3(\s[^>]*)?>/gi, '<h2$1>').replace(/<\/h3>/gi, '</h2>');
  }

  // 12. Final cleanup of empty blocks
  out = out.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
  out = out.replace(/<ul[^>]*>\s*<\/ul>/gi, '');
  out = out.replace(/<ol[^>]*>\s*<\/ol>/gi, '');
  out = out.replace(/(?:\s|&nbsp;)+<\/p>/gi, '</p>');

  return out.trim();
};

export default cleanPostHtml;
