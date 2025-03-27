import { redirect } from 'next/navigation';

export default function RunningApplicationPage() {
  redirect('/admin/running-application/env-variables');
}
