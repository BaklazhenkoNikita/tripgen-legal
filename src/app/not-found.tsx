import Link from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const APP_STORE_URL = 'https://apps.apple.com/app/id6761609896';

export default function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 6,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: { xs: 4, sm: 5 }, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <Image
              src="/assets/logo-terra.png"
              alt="Periplo"
              width={56}
              height={56}
              priority
            />
          </Box>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 26, sm: 30 }, lineHeight: 1.2, color: 'text.primary' }}
          >
            Page not found
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'text.secondary', fontSize: 15 }}>
            The link you followed may be broken, or the page may have moved.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="center"
            sx={{ mt: 3.5 }}
          >
            <Button
              component={Link}
              href="/"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 999, px: 3, py: 1.25 }}
            >
              Go home
            </Button>
            <Button
              component="a"
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="primary"
              sx={{ borderRadius: 999, px: 3, py: 1.25 }}
            >
              Open in app
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
