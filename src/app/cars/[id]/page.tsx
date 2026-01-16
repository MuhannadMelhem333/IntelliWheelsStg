import { CarDetailView } from '@/components/CarDetailView';

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;

  return <CarDetailView carId={id} />;
}
