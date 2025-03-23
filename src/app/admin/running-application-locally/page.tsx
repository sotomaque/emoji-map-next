import { redirect } from 'next/navigation';

export default function RunningApplicationLocallyPage() {
  redirect('/admin/running-application-locally/env-variables');
}
