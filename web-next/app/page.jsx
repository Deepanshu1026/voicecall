import UserHome from '../components/pages/UserHome';
import { resolveImageUrl, resolveReviewImage } from '../lib/imageUrl';

export const metadata = {
  title: 'Visa Consultant in Noida & Delhi NCR | A Visa Experts',
  description:
    'A Visa Experts helps with tourist and transit visas for USA, UK, Canada, Europe and Australia. Visit our Noida office in Sector 2 or call +91 9711000022.',
  alternates: { canonical: 'https://avisaexperts.com/', languages: { en: '/', 'en-IN': '/', 'x-default': '/' } },
  openGraph: {
    title: 'Visa Consultant in Noida & Delhi NCR | A Visa Experts',
    description:
      'Tourist and transit visas for USA, UK, Canada, Europe and Australia. Noida office in Sector 2, or call +91 9711000022.',
    url: 'https://avisaexperts.com/',
    images: ['/images/user/slider4 1.webp'],
  },
};

async function getReviews() {
  try {
    const res = await fetch('https://voicecall-6ylg.onrender.com/api/app/reviews', {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    const list = json?.data;
    if (Array.isArray(list) && list.length > 0) {
      return list.map((r, i) => ({
        id: r.id || r._id || i,
        img: resolveReviewImage(r.user_image),
        name: r.user_name || '',
        visa: r.visa_type || '',
        text: r.story || '',
        stars: Number(r.rating) || 5,
      }));
    }
  } catch (e) {
    // fall back to client-side fetch
  }
  return [];
}

export default async function Page() {
  const reviews = await getReviews();
  return <UserHome initialReviews={reviews} />;
}
