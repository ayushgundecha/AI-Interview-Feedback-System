import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
  IconButton,
  Paper,
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  Assessment as AssessmentIcon,
  EmojiEmotions as EmojiIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const features = [
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Real-time Analysis',
      description: 'Get instant feedback on your interview performance with our advanced AI technology.',
    },
    {
      icon: <EmojiIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Emotion Detection',
      description: 'Track your facial expressions and emotions throughout the interview process.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Performance Metrics',
      description: 'Detailed metrics and insights to help you improve your interview skills.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security measures.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      
      {/* Hero Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Master Your Interview Skills
              </Typography>
              <Typography variant="h5" paragraph>
                Get real-time feedback and improve your interview performance with AI-powered analysis.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <ProtectedRoute>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<PlayIcon />}
                    sx={{ borderRadius: 2 }}
                    onClick={() => router.push('/resume-upload')}
                  >
                    Start Practice
                  </Button>
                </ProtectedRoute>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  endIcon={<ArrowIcon />}
                  sx={{ borderRadius: 2 }}
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: 400,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Paper
                  elevation={24}
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                    transition: 'transform 0.3s ease-in-out',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <img
                    src="/interview-management-system.jpeg"
                    alt="Interview Management System"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '16px',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/fallback-image.jpeg';
                    }}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="features">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 6 }}
        >
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Ready to Improve Your Interview Skills?
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Join thousands of users who have enhanced their interview performance with our AI-powered platform.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <ProtectedRoute>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PlayIcon />}
                sx={{ borderRadius: 2 }}
                onClick={() => router.push('/resume-upload')}
              >
                Get Started Now
              </Button>
            </ProtectedRoute>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 