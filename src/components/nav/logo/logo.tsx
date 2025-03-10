import Image from 'next/image';

export function Logo() {
  return (
    <div className='flex items-center'>
      <Image
        src='/logo-no-background.png'
        alt='Emoji Map Logo'
        width={56}
        height={56}
        className='mr-3 rounded-xl shadow-sm'
      />
      <span className='text-white font-bold text-xl'>Emoji Map</span>
    </div>
  );
}
