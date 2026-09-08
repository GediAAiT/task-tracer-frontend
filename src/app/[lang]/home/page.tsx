import { notFound } from 'next/navigation';
import { HomeComponent } from '@/app/component/task/home/home.component';
import { LOCALES, isLocale } from '@/app/model/i18n/locale';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Page({ params }: PageProps<'/[lang]/home'>) {
  const { lang } = await params;

  if (!isLocale(lang)) notFound();

  return <HomeComponent />;
}
