import {
  HackerCard,
  HackerCardHeader,
  HackerTitle,
} from '../server-ui-components';
import ClientWrapper from './client-wrapper';

// This is a server component that provides the layout structure
export default function PlaceDetailsLayout() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
      <HackerCard>
        <HackerCardHeader>
          <HackerTitle>place_details_api</HackerTitle>
          <div className='text-cyan-700 dark:text-cyan-700 font-mono text-xs mt-2'>
            Test the /api/places/details endpoint with a place ID
          </div>
        </HackerCardHeader>

        {/* Client wrapper component that doesn't require props from server */}
        <ClientWrapper />
      </HackerCard>
    </div>
  );
}
