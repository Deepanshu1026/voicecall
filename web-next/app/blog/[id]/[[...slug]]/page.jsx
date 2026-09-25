import { notFound } from 'next/navigation';
import BlogDetail from '../../../../components/pages/BlogDetail';
import { blogAPI } from '../../../../lib/api';

export const revalidate = 300;

const slugify = (text) =>
  (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const stripHtml = (html) =>
  html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

async function getPost(id) {
  try {
    const res = await blogAPI.getPostById(id);
    const found = res.data?.data;
    if (!found) return null;
    return {
      ...found,
      id: found._id || found.legacyId,
      featured_image: found.featuredImage || '',
      image_alt: found.imageAlt || '',
      created_at: found.createdAt,
      category: found.category || 'General',
    };
  } catch (e) {
    return null;
  }
}

async function getRelated(id) {
  try {
    const res = await blogAPI.getRelatedPosts(id);
    const others = res.data?.data || [];
    return others.map((p) => ({
      ...p,
      id: p._id || p.legacyId,
      featured_image: p.featuredImage || '',
      image_alt: p.imageAlt || '',
      created_at: p.createdAt,
    }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.id);
  if (!post) {
    return {
      title: 'Article Not Found | A Visa Experts Blog',
      robots: { index: false, follow: true },
    };
  }
  const desc = post.excerpt
    ? stripHtml(post.excerpt).slice(0, 160)
    : stripHtml(post.content).slice(0, 160);
  const url = `https://avisaexperts.com/blog/${post.id}/${slugify(post.title)}`;
  const image = post.featured_image || '/images/user/touristvisa_full 1.webp';
  return {
    title: `${post.title} | A Visa Experts Blog`,
    description: desc,
    keywords: ['visa', 'immigration', 'A Visa Experts', 'Kaveesh Kapoor', post.category]
      .filter(Boolean)
      .join(', '),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: desc,
      url,
      images: [image],
      siteName: 'A Visa Experts',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: desc,
      images: [image],
    },
  };
}

export default async function Page({ params }) {
  const [post, related] = await Promise.all([getPost(params.id), getRelated(params.id)]);
  if (!post) notFound();
  return <BlogDetail post={post} related={related} />;
}
