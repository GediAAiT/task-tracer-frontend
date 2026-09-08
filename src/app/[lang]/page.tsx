import { notFound, redirect } from 'next/navigation';
import { LOCALES, isLocale } from '@/app/model/i18n/locale';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;

  if (!isLocale(lang)) notFound();

  redirect(`/${lang}/home`);
}
