import { Container, Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import {
  Code as CodeIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

export default function About() {
  const theme = useTheme();

  const teamMembers = [
    {
      name: 'Shriansh Singh Jaswal',
      role: 'AI Engineer',
      icon: <CodeIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
    },
    {
      name: 'Ayush Gundecha',
      role: 'Full Stack Developer',
      icon: <SchoolIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
    },
    {
      name: 'Shruti Jain',
      role: 'Full Stack Developer',
      icon: <PsychologyIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* About Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4 }}
          >
            About Our Platform
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            We're revolutionizing the way people prepare for interviews by leveraging cutting-edge AI technology
            to provide real-time feedback and personalized insights.
          </Typography>
        </Box>

        {/* Mission Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4 }}
          >
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            Our mission is to democratize access to high-quality interview preparation tools. We believe that
            everyone deserves the opportunity to present their best self during interviews, regardless of their
            background or experience level.
          </Typography>
          <Typography variant="body1" paragraph>
            By combining advanced AI technology with proven interview techniques, we help candidates build
            confidence, improve their communication skills, and increase their chances of landing their dream job.
          </Typography>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4 }}
          >
            Our Team
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ mb: 2 }}>{member.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography color="text.secondary">{member.role}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Technology Section */}
        <Box>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4 }}
          >
            Our Technology
          </Typography>
          <Typography variant="body1" paragraph>
            We utilize state-of-the-art AI models for:
          </Typography>
          <ul>
            <li>Real-time speech analysis and feedback</li>
            <li>Facial expression and emotion detection</li>
            <li>Natural language processing for content analysis</li>
            <li>Personalized performance metrics and recommendations</li>
          </ul>
        </Box>
      </Container>
    </Box>
  );
} 