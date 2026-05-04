import type { Transition, Variants } from 'framer-motion';

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.9,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 32,
  mass: 0.7,
};

export const easeOut: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: springSoft },
};

export const sheetSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
};

export const drawerSpring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 36,
};

export const stagger = (delay = 0.04): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: delay, delayChildren: 0.02 },
  },
});
