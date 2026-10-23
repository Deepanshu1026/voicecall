import UserHome from '../components/pages/UserHome';
import { resolveImageUrl, resolveReviewImage } from '../lib/imageUrl';

export const metadata = {
  title: 'A Visa Experts | Visitor Visa & Immigration Consultants',
  description:
    'Visitor visa and immigration consultancy in India. Expert guidance for UK, USA, Canada & Europe visitor visas, plus visa refusal support. Free advice.',
  alternates: { canonical: 'https://avisaexperts.com/', languages: { en: '/', 'en-IN': '/', 'x-default': '/' } },
  openGraph: {
    title: 'A Visa Experts | Visitor Visa & Immigration Consultants',
    description:
      'Visitor visa and immigration consultancy in India. Expert guidance for UK, USA, Canada & Europe visitor visas, plus visa refusal support.',
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
