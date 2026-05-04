const heroSurfaceBackgroundCss = `
    linear-gradient(180deg, rgba(var(--tg-palette-background-paperChannel) / 0.94) 0%, var(--tg-palette-background-default) 35%, var(--tg-palette-background-default) 100%),
    radial-gradient(circle at 10% 10%, rgba(var(--tg-palette-primary-mainChannel) / 0.16) 0%, transparent 50%),
    radial-gradient(circle at 90% 15%, rgba(var(--tg-palette-secondary-mainChannel) / 0.12) 0%, transparent 45%)
  `;

export const heroSurfaceBackground = heroSurfaceBackgroundCss;

export const surfaceBackgroundSx = {
  backgroundColor: 'var(--tg-palette-background-default)',
  backgroundImage: heroSurfaceBackgroundCss,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
} as const;
