import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  PlayCircleOutline as PlayIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Interview {
  id: number;
  date: string;
  type: string;
  score: number;
  duration: string;
  emotionData?: any[];
  answers?: { [key: number]: string };
  answerAnalysis?: { [key: number]: any };
}

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  emailUpdates: boolean;
  interviewReminders: boolean;
  feedbackFrequency: 'immediate' | 'daily' | 'weekly';
}

export default function Dashboard() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    interviewReminders: true,
    feedbackFrequency: 'immediate',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        // In a real application, this would fetch from your API
        // For now, we'll use mock data
        const mockInterviews: Interview[] = [
          {
            id: 1,
            date: '2024-03-15',
            type: 'Technical Interview',
            score: 85,
            duration: '45 minutes',
            emotionData: [],
            answers: {},
            answerAnalysis: {}
          },
          {
            id: 2,
            date: '2024-03-10',
            type: 'Behavioral Interview',
            score: 78,
            duration: '30 minutes',
          },
          {
            id: 3,
            date: '2024-03-05',
            type: 'Technical Interview',
            score: 92,
            duration: '60 minutes',
          },
        ];
        setRecentInterviews(mockInterviews);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setOpenDialog(true);
  };

  const handleDownloadReport = async (interviewId: number) => {
    try {
      const response = await fetch(`/api/reports/${interviewId}`);
      if (!response.ok) throw new Error('Failed to download report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-report-${interviewId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleSettingsChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // In a real application, this would save to your backend
      // For now, we'll just show a success message
      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 4 }}
        >
          Dashboard
        </Typography>

        <Paper sx={{ width: '100%', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<AssessmentIcon />} label="Overview" />
            <Tab icon={<HistoryIcon />} label="History" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {/* Performance Overview */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Overview
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Your average interview score has improved by 15% over the last month.
                  </Typography>
                  <Typography variant="h4" color="primary">
                    82%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Average Score
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button startIcon={<PlayIcon />} color="primary" onClick={() => router.push('/resume-upload')}>
                    Start New Interview
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  {recentInterviews.map((interview, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body1">{interview.type}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {interview.date} • {interview.duration}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        color={
                          interview.score >= 80
                            ? 'success.main'
                            : interview.score >= 60
                            ? 'warning.main'
                            : 'error.main'
                        }
                      >
                        {interview.score}%
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Interview History
          </Typography>
          {loading ? (
            <Typography>Loading interviews...</Typography>
          ) : (
            <Grid container spacing={4}>
              {recentInterviews.map((interview, index) => (
                <Grid item xs={12} key={index}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="h6">{interview.type}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {interview.date} • {interview.duration}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h4"
                          color={
                            interview.score >= 80
                              ? 'success.main'
                              : interview.score >= 60
                              ? 'warning.main'
                              : 'error.main'
                          }
                        >
                          {interview.score}%
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(interview)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadReport(interview.id)}
                      >
                        Download Report
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notification Preferences
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications}
                        onChange={(e) => handleSettingsChange('notifications', e.target.checked)}
                      />
                    }
                    label="Enable Notifications"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailUpdates}
                        onChange={(e) => handleSettingsChange('emailUpdates', e.target.checked)}
                      />
                    }
                    label="Email Updates"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.interviewReminders}
                        onChange={(e) => handleSettingsChange('interviewReminders', e.target.checked)}
                      />
                    }
                    label="Interview Reminders"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Feedback Preferences
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    label="Feedback Frequency"
                    value={settings.feedbackFrequency}
                    onChange={(e) => handleSettingsChange('feedbackFrequency', e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Summary</option>
                    <option value="weekly">Weekly Summary</option>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveSettings}
                    sx={{ mt: 2 }}
                  >
                    Save Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Interview Details - {selectedInterview?.type}
          </DialogTitle>
          <DialogContent>
            {selectedInterview && (
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Date" 
                    secondary={selectedInterview.date}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Duration" 
                    secondary={selectedInterview.duration}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Score" 
                    secondary={`${selectedInterview.score}%`}
                  />
                </ListItem>
                {selectedInterview.emotionData && (
                  <ListItem>
                    <ListItemText 
                      primary="Emotion Analysis" 
                      secondary={`${selectedInterview.emotionData.length} data points collected`}
                    />
                  </ListItem>
                )}
                {selectedInterview.answers && (
                  <ListItem>
                    <ListItemText 
                      primary="Questions Answered" 
                      secondary={Object.keys(selectedInterview.answers).length}
                    />
                  </ListItem>
                )}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            {selectedInterview && (
              <Button 
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadReport(selectedInterview.id)}
              >
                Download Full Report
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 