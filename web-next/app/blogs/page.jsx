import Blogs from '../../components/pages/Blogs';
import { blogAPI } from '../../lib/api';

export const revalidate = 300;

export const metadata = {
  title: 'A Visa Experts Blog | Visa Tips, Guides & Success Stories',
  description:
    "Explore expert visa tips, country guides, immigration updates, and success stories from A Visa Experts, India's trusted visa and immigration company.",
  keywords:
    'visa blog, immigration tips, tourist visa, work visa, Canada visa, UK visa, Australia visa, Kaveesh Kapoor, A Visa Experts',
  alternates: { canonical: '/blogs' },
  openGraph: {
    type: 'website',
    title: 'A Visa Experts Blog | Visa Tips & Immigration Guides',
    description:
      'Stay updated with expert visa tips, country guides, and success stories from A Visa Experts.',
    url: 'https://avisaexperts.com/blogs',
    images: ['https://avisaexperts.com/images/user/touristvisa_full 1.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Visa Experts Blog | Visa Tips & Immigration Guides',
    description:
      'Stay updated with expert visa tips, country guides, and success stories from A Visa Experts.',
    images: ['https://avisaexperts.com/images/user/touristvisa_full 1.webp'],
  },
};

const deriveCategory = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('work') || t.includes('seasonal') || t.includes('lmia') || t.includes('permit')) return 'Work Visa';
  if (t.includes('tourist') || t.includes('travel') || t.includes('visitor')) return 'Tourist Visa';
  if (t.includes('kaveesh kapoor')) return 'Leadership';
  if (t.includes('app') || t.includes('consultation')) return 'Company News';
  if (t.includes('canada') || t.includes('uk') || t.includes('russia') || t.includes('japan') || t.includes('australia') || t.includes('hong kong') || t.includes('usa') || t.includes('europe')) return 'Country Guides';
  return 'General';
};

export default async function Page() {
  let posts = [];
  try {
    const res = await blogAPI.getPosts({ limit: 100 });
    const data = res.data?.data || [];
    posts = data.map((post) => ({
      ...post,
      id: post._id || post.legacyId,
      featured_image: post.featuredImage || '',
      image_alt: post.imageAlt || '',
      created_at: post.createdAt,
      derivedCategory: post.category || deriveCategory(post.title),
    }));
  } catch (e) {
    posts = [];
  }

  return <Blogs initialPosts={posts} />;
}
