import React from 'react';

const LoadingDocs: React.FC = () => {
  return (
    <div className='swagger-container pt-4 animate-pulse'>
      {/* Information Container */}
      <div className='information-container wrapper'>
        <section className='block col-12'>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm mb-6'>
            <div className='info'>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4'></div>
              <div className='description'>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2'></div>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3'></div>
              </div>
              <div className='info__contact mt-4'>
                <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-40'></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Scheme Container */}
      <div className='scheme-container'>
        <section className='schemes wrapper block col-12'>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm mb-6'>
            <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2'></div>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64'></div>
          </div>
        </section>
      </div>

      {/* Filter Container */}
      <div className='filter-container'>
        <section className='filter wrapper block col-12'>
          <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded mb-6'></div>
        </section>
      </div>

      {/* Operations Container */}
      <div className='wrapper'>
        <section className='block col-12 block-desktop col-12-desktop'>
          <div className='bg-white dark:bg-gray-800 rounded-md shadow-sm mb-6'>
            {/* Tag Section */}
            <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex justify-between items-center'>
                <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4'></div>
                <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-6'></div>
              </div>
            </div>

            {/* Operations */}
            <div className='p-2'>
              {/* GET Operation */}
              <div className='mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md'>
                <div className='flex items-center'>
                  <div className='h-6 w-16 bg-blue-500 dark:bg-blue-700 rounded text-center text-white font-bold mr-4'></div>
                  <div className='h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                </div>
              </div>

              {/* Another GET Operation */}
              <div className='mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md'>
                <div className='flex items-center'>
                  <div className='h-6 w-16 bg-blue-500 dark:bg-blue-700 rounded text-center text-white font-bold mr-4'></div>
                  <div className='h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Models/Schemas Section */}
      <div className='wrapper'>
        <section className='block col-12 block-desktop col-12-desktop'>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm'>
            <div className='flex justify-between items-center mb-4'>
              <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-24'></div>
              <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-6'></div>
            </div>

            {/* Model Items */}
            <div className='space-y-2'>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded'></div>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded'></div>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded'></div>
            </div>
          </div>
        </section>
      </div>

      {/* Loading Text */}
      <div className='flex justify-center mt-8 mb-4'>
        <div className='text-gray-500 dark:text-gray-400 font-medium'>
          Loading API documentation...
        </div>
      </div>
    </div>
  );
};

export default LoadingDocs;
