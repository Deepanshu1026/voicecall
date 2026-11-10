import { urlset, xmlResponse, getPublishedPosts } from '../../lib/sitemap';

export const revalidate = 3600;

export async function GET() {
  const posts = await getPublishedPosts();
  return xmlResponse(
    urlset(
      posts.map((p) => ({
        path: `/blog/${p.slug}`,
        lastmod: p.updatedAt || p.publishedAt || p.createdAt,
      }))
    )
  );
}
