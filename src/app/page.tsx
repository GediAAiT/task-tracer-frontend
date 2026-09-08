import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/app/model/i18n/locale';

export default function Page() {
  redirect(`/${DEFAULT_LOCALE}/home`);
}
