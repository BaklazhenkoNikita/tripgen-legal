import Box from '@mui/material/Box';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

// Single shell for all /legal/* routes — same chrome as the (marketing)
// group. Pages render only their content (most via <LegalLayout>, which is
// now just the header + prose container).
export default function LegalRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      <Box component="main" sx={{ flex: 1 }}>{children}</Box>
      <Footer />
    </Box>
  );
}
