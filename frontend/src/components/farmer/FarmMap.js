'use client';

import dynamic from 'next/dynamic';

const FarmMapLeaflet = dynamic(() => import('./FarmMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full items-center justify-center bg-stone-50 text-sm text-stone-500">
      Loading map preview...
    </div>
  ),
});

export default function FarmMap(props) {
  return <FarmMapLeaflet {...props} />;
}