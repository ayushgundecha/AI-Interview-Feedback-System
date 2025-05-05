import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

export default function ResumeUpload() {
  const theme = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [interviewType, setInterviewType] = useState<'technical' | 'hr'>('technical');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleStartInterview = () => {
    if (!selectedFile) {
      setError('Please upload your resume first');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Store the interview type in localStorage
    localStorage.setItem('interviewType', interviewType);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        try {
          // Convert the file content to base64
          const base64Content = e.target.result as string;
          
          // Store only the first 1000 characters of the content
          // This is a temporary solution - in a real app, you would:
          // 1. Upload the file to a server
          // 2. Store only the file reference in localStorage
          // 3. Process the file on the server side
          const compressedContent = base64Content.substring(0, 1000);
          localStorage.setItem('resumeContent', compressedContent);
          router.push('/interview');
        } catch (err) {
          setError('Error processing the file. Please try again.');
          console.error('Error processing file:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    reader.onerror = () => {
      setError('Error reading the file. Please try again.');
      setIsLoading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <DescriptionIcon
            sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }}
          />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Upload Your Resume
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" paragraph>
            Upload your resume to get personalized interview questions and feedback.
            Supported formats: PDF, DOC, DOCX (Max size: 5MB)
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              width: '100%',
              mb: 3,
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom>
              {selectedFile ? selectedFile.name : 'Click to upload your resume'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, DOC, DOCX
            </Typography>
          </Box>

          <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Interview Type
            </Typography>
            <RadioGroup
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value as 'technical' | 'hr')}
            >
              <FormControlLabel
                value="technical"
                control={<Radio />}
                label="Technical Interview"
              />
              <FormControlLabel
                value="hr"
                control={<Radio />}
                label="HR Interview"
              />
            </RadioGroup>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStartInterview}
            disabled={!selectedFile || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            fullWidth
            sx={{ height: 48 }}
          >
            {isLoading ? 'Processing...' : 'Start Interview'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
} 