import Image from 'next/image';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { surfaceBackgroundSx } from '@/theme/backgrounds';

const APP_STORE_URL = 'https://apps.apple.com/app/id6761609896';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.periploapp.android';

export interface HandoffCardProps {
  /** Subhead below the H1 — context-specific copy per page. */
  subhead: string;
  /** Optional deep-link URL using the periplo:// scheme to open the app directly. */
  deepLink?: string;
  /** Optional caption (e.g. resource id) shown in small muted text under the CTAs. */
  caption?: string;
}

export function HandoffCard({ subhead, deepLink, caption }: HandoffCardProps) {
  return (
    <Box
      sx={{
        ...surfaceBackgroundSx,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 4 },
        py: { xs: 6, sm: 8 },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 480,
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Box
              sx={{
                position: 'relative',
                width: 72,
                height: 72,
              }}
            >
              <Image
                src="/assets/logo-terra.png"
                alt="Periplo"
                fill
                sizes="72px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>

            <Stack spacing={1.5}>
              <Typography variant="h1" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' }, lineHeight: 1.15 }}>
                Open this in the Periplo app
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {subhead}
              </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get it on the App Store
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get it on Google Play
              </Button>
            </Stack>

            {deepLink ? (
              <Typography variant="body2" color="text.secondary">
                Already have it?{' '}
                <Box
                  component="a"
                  href={deepLink}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Open in app
                </Box>
              </Typography>
            ) : null}

            {caption ? (
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {caption}
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
