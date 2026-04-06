'use client';

import { motion, useMotionValue, animate, useTransform } from 'framer-motion';
import { Sprout, ScanLine, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/ui/Logo';
import { useEffect } from 'react';

const products = [
  {
    id: 1,
    name: "Organic Tomatoes",
    farm: "Green Valley, CA",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop",
    status: "In Transit",
    progress: 75,
    color: "emerald"
  },
  {
    id: 2,
    name: "Fresh Romaine",
    farm: "Sunny Hills, OR",
    image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=800&auto=format&fit=crop",
    status: "Processing",
    progress: 45,
    color: "lime"
  },
  {
    id: 3,
    name: "Crisp Carrots",
    farm: "River Bend Farm",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800&auto=format&fit=crop",
    status: "Verified",
    progress: 100,
    color: "orange"
  }
];

const colorClasses = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500' },
  lime: { text: 'text-lime-400', bg: 'bg-lime-500', border: 'border-lime-500' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500' },
};

const CARD_SIZE = 280;
const PROXIMITY = 300;

function CardItem({ product, index, baseY, scrollY }) {
  const y = useTransform(scrollY, value => value + baseY);

  // Smooth Scale
  const scale = useTransform(y, (latestY) => {
    const centerOffset = 160;
    const dist = Math.abs(latestY - centerOffset);
    const normalized = Math.min(dist / PROXIMITY, 1);
    return 1.0 - (normalized * 0.1);
  });

  const highlight = useTransform(y, (latestY) => {
    const centerOffset = 160;
    const dist = Math.abs(latestY - centerOffset);
    // More solid opacity for non-centered items to make list feel full
    return dist < 140 ? 1 : 0.7;
  });

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity: highlight,
        zIndex: useTransform(highlight, h => h > 0.8 ? 20 : 1),
        height: CARD_SIZE,
        width: CARD_SIZE,
      }}
      className="absolute left-0 right-0 mx-auto"
    >
      {/* SQUARE CARD */}
      <div className="relative w-full h-full bg-[var(--color-bone)] rounded-3xl overflow-hidden border border-[rgba(53,64,36,0.14)] shadow-2xl flex flex-col group">

        {/* Image Section */}
        <div className="relative w-full h-[60%] shrink-0 overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
          {/* Darker overlay on image for contrast */}
          <div className="absolute inset-0 bg-[rgba(53,64,36,0.08)] group-hover:bg-transparent transition-colors" />
          <div className={`absolute top-3 right-3 px-2 py-1 rounded bg-[rgba(53,64,36,0.85)] backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-[rgba(229,215,196,0.12)] ${colorClasses[product.color].text}`}>
            {product.status}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col justify-between relative bg-[var(--color-tan)] border-t border-[rgba(53,64,36,0.14)]">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-bold text-[var(--color-cafe-noir)] tracking-wide truncate w-full">{product.name}</h3>
              {product.status === "Verified" && (
                <ShieldCheck className="w-5 h-5 text-[var(--color-kombu-green)] shrink-0" />
              )}
            </div>
            <p className="text-xs text-[rgba(76,61,25,0.72)] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[var(--color-moss-green)]/80" /> {product.farm}
            </p>
          </div>

          <div className="space-y-1.5 w-full">
            <div className="h-1.5 w-full bg-[rgba(53,64,36,0.12)] rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClasses[product.color].bg} shadow-[0_0_8px_currentColor]`}
                style={{ width: `${product.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const scrollY = useMotionValue(0);
  const duplicatedProducts = [...products, ...products, ...products, ...products, ...products, ...products];
  const totalHeight = products.length * 320;

  useEffect(() => {
    const controls = animate(scrollY, -totalHeight, {
      duration: 8,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return controls.stop;
  }, [scrollY, totalHeight]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[var(--color-bone)] font-sans">

      {/* Background - Darker for readability */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop"
          alt="Background"
          fill
          className="object-cover opacity-100"
          priority
        />
        {/* Stronger Dark Overlay (50%) to make white text pop */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(53,64,36,0.12),rgba(229,215,196,0.1))]" />
        {/* Additional Gradient on Left for Title readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(53,64,36,0.84)] via-[rgba(53,64,36,0.42)] to-transparent" />
      </div>

      <nav className="absolute top-0 w-full p-6 z-50 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <Logo size="medium" color="white" />
        <div className="hidden md:flex items-center gap-4">
          <Link href="/about" className="text-sm font-bold text-[var(--color-bone)] hover:text-[var(--color-tan)] transition-colors uppercase tracking-wide drop-shadow-md">
            How it Works
          </Link>
          <Link href="/auth/login">
            {/* Green Login Button */}
            <button className="h-10 px-6 rounded-full bg-[var(--color-kombu-green)] hover:bg-[var(--color-cafe-noir)] text-[var(--color-bone)] text-sm font-bold shadow-lg shadow-black/20 transition-all hover:scale-105">
              Login
            </button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row max-w-7xl mx-auto px-6 h-full items-center">

        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-6 h-full relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(53,64,36,0.72)] border border-[rgba(229,215,196,0.24)] text-[var(--color-bone)] text-xs font-bold uppercase tracking-wider mb-6 w-fit backdrop-blur-md shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[var(--color-tan)] animate-pulse"></span>
              Live Tracking
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-bone)] leading-[1.1] tracking-tight mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]">
              From Farm <br />
              <span className="text-[var(--color-tan)] drop-shadow-md">
                To Fork.
              </span>
            </h1>

            <p className="text-lg text-[var(--color-bone)]/90 max-w-lg leading-relaxed mb-8 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
              The world's first fully transparent food supply chain.
              Verify origin, quality, and freshness in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/login?role=farmer">
                <button className="h-14 px-8 rounded-xl bg-[var(--color-kombu-green)] hover:bg-[var(--color-cafe-noir)] text-[var(--color-bone)] font-bold flex items-center gap-2 shadow-lg shadow-black/20 hover:-translate-y-1 transition-transform border border-[rgba(229,215,196,0.18)]">
                  <Sprout className="w-5 h-5" />
                  I'm a Farmer
                </button>
              </Link>
              <Link href="/auth/login?role=consumer">
                <button className="h-14 px-8 rounded-xl bg-[var(--color-tan)] hover:bg-[var(--color-moss-green)] border border-[rgba(53,64,36,0.2)] text-[var(--color-cafe-noir)] font-bold flex items-center gap-2 backdrop-blur-md hover:-translate-y-1 transition-transform cursor-pointer">
                  <ScanLine className="w-5 h-5 text-[var(--color-kombu-green)]" />
                  Verify Product
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Rolling Squre Cards */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center lg:pl-16">
          <div
            className="relative w-full max-w-[400px] h-[600px] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)'
            }}
          >
            {duplicatedProducts.map((product, index) => {
              const baseY = index * 320;
              return (
                <CardItem
                  key={`${product.id}-${index}`}
                  product={product}
                  index={index}
                  baseY={baseY}
                  scrollY={scrollY}
                />
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
