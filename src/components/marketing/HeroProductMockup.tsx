'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { tgShadow } from '@/theme/shadows';

const TILE_RADIUS = 32;
const TILE_ASPECT = 600 / 1280;

export function HeroProductMockup() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const backY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [40, -60]);
  const frontY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [20, -30]);

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: { xs: 360, sm: 420, md: 520 },
        mx: 'auto',
        aspectRatio: { xs: '4 / 5', md: '5 / 6' },
        order: { xs: 2, md: 0 },
      }}
    >
      <motion.div
        style={{ y: backY, position: 'absolute', top: 0, right: '4%', width: '54%', height: '92%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transform: 'rotate(7deg)',
            transformOrigin: 'center center',
            borderRadius: `${TILE_RADIUS}px`,
            overflow: 'hidden',
            boxShadow: (t) => tgShadow(t, 'sheet'),
            aspectRatio: `${TILE_ASPECT}`,
          }}
        >
          <Image
            src="/assets/screenshots/route-map.webp"
            alt="Periplo route map showing a Day 1 walking route through Barcelona's Ciutat Vella with hidden-gem stops"
            fill
            priority={false}
            sizes="(max-width: 600px) 50vw, (max-width: 900px) 30vw, 280px"
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          />
        </Box>
      </motion.div>

      <motion.div
        style={{ y: frontY, position: 'absolute', bottom: 0, left: '2%', width: '58%', height: '94%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transform: 'rotate(-5deg)',
            transformOrigin: 'center center',
            borderRadius: `${TILE_RADIUS}px`,
            overflow: 'hidden',
            boxShadow: (t) => tgShadow(t, 'sheet'),
            aspectRatio: `${TILE_ASPECT}`,
          }}
        >
          <Image
            src="/assets/screenshots/trip-detail.webp"
            alt="Periplo Barcelona itinerary — 3 days, 19 activities, day-by-day breakdown with curated stops"
            fill
            priority
            sizes="(max-width: 600px) 60vw, (max-width: 900px) 32vw, 300px"
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          />
        </Box>
      </motion.div>
    </Box>
  );
}
