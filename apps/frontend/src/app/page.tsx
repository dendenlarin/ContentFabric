import { redirect } from 'next/navigation';

/**
 * Главная страница - редирект на /templates
 */
export default function HomePage() {
  redirect('/templates');
}
