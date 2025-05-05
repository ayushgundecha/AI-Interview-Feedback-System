import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EmotionData {
  timestamp: number;
  emotions: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  };
  questionId: number;
}

interface AnswerAnalysis {
  clarity: number;
  confidence: number;
  structure: number;
  keywords: string[];
  feedback: string;
}

const defaultEmotions = {
  neutral: 0,
  happy: 0,
  sad: 0,
  angry: 0,
  fearful: 0,
  disgusted: 0,
  surprised: 0
};

export default function Results() {
  const router = useRouter();
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [averageEmotions, setAverageEmotions] = useState<{ [key: string]: number }>(defaultEmotions);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [answerAnalysis, setAnswerAnalysis] = useState<{ [key: number]: AnswerAnalysis }>({});

  useEffect(() => {
    const storedEmotionData = localStorage.getItem('emotionData');
    const storedAnswers = localStorage.getItem('answers');
    const storedAnswerAnalysis = localStorage.getItem('answerAnalysis');
    
    if (storedEmotionData) {
      try {
        const parsedData: EmotionData[] = JSON.parse(storedEmotionData);
        setEmotionData(parsedData);

        if (parsedData.length > 0) {
          const emotions = parsedData.reduce((acc, curr) => {
            Object.entries(curr.emotions).forEach(([emotion, value]) => {
              acc[emotion] = (acc[emotion] || 0) + value;
            });
            return acc;
          }, {} as { [key: string]: number });

          Object.keys(emotions).forEach((emotion) => {
            emotions[emotion] = emotions[emotion] / parsedData.length;
          });

          setAverageEmotions(emotions);
        }
      } catch (error) {
        console.error('Error parsing emotion data:', error);
        setAverageEmotions(defaultEmotions);
      }
    }

    if (storedAnswers) {
      try {
        setAnswers(JSON.parse(storedAnswers));
      } catch (error) {
        console.error('Error parsing answers:', error);
      }
    }

    if (storedAnswerAnalysis) {
      try {
        setAnswerAnalysis(JSON.parse(storedAnswerAnalysis));
      } catch (error) {
        console.error('Error parsing answer analysis:', error);
      }
    }
  }, []);

  const chartData = {
    labels: Object.keys(averageEmotions),
    datasets: [
      {
        label: 'Average Emotion Levels',
        data: Object.values(averageEmotions),
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(201, 203, 207, 0.5)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Emotion Analysis During Interview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  const generateFeedback = () => {
    const feedback = [];
    
    // Check if we have emotion data
    if (Object.keys(averageEmotions).length === 0) {
      feedback.push({
        title: 'No Emotion Data Available',
        content: 'We were unable to capture emotion data during the interview. Please ensure your camera was properly set up and try again.',
      });
      return feedback;
    }

    // Emotion feedback
    const dominantEmotion = Object.entries(averageEmotions).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];

    feedback.push({
      title: 'Overall Emotional State',
      content: `Throughout the interview, you predominantly displayed ${dominantEmotion} emotions. ${
        dominantEmotion === 'neutral' 
          ? 'This suggests good emotional control and professionalism.'
          : dominantEmotion === 'happy'
          ? 'This indicates enthusiasm and positive engagement.'
          : 'This might need some attention in future interviews.'
      }`,
    });

    if (averageEmotions.fearful > 0.3) {
      feedback.push({
        title: 'Confidence',
        content: 'You showed signs of nervousness. Try practicing more mock interviews to build confidence.',
      });
    }

    if (averageEmotions.neutral > 0.5) {
      feedback.push({
        title: 'Professional Demeanor',
        content: 'You maintained a professional composure throughout most of the interview. This is excellent!',
      });
    }

    // Answer analysis feedback
    if (Object.keys(answerAnalysis).length > 0) {
      const overallClarity = Object.values(answerAnalysis).reduce((sum, analysis) => 
        sum + analysis.clarity, 0) / Object.keys(answerAnalysis).length;
      
      const overallConfidence = Object.values(answerAnalysis).reduce((sum, analysis) => 
        sum + analysis.confidence, 0) / Object.keys(answerAnalysis).length;
      
      const overallStructure = Object.values(answerAnalysis).reduce((sum, analysis) => 
        sum + analysis.structure, 0) / Object.keys(answerAnalysis).length;

      feedback.push({
        title: 'Answer Quality Analysis',
        content: `Your answers showed ${
          overallClarity > 0.7 ? 'excellent' : overallClarity > 0.5 ? 'good' : 'room for improvement in'
        } clarity, ${
          overallConfidence > 0.7 ? 'high' : overallConfidence > 0.5 ? 'moderate' : 'low'
        } confidence, and ${
          overallStructure > 0.7 ? 'strong' : overallStructure > 0.5 ? 'adequate' : 'weak'
        } structure.`,
      });

      // Specific feedback for each answer
      Object.entries(answerAnalysis).forEach(([questionId, analysis]) => {
        if (analysis.feedback) {
          feedback.push({
            title: `Question ${parseInt(questionId) + 1} Feedback`,
            content: analysis.feedback,
          });
        }
      });
    }

    return feedback;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Interview Analysis
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Bar data={chartData} options={chartOptions} />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Detailed Feedback
              </Typography>
              <List>
                {generateFeedback().map((item, index) => (
                  <ListItem key={index} divider={index !== generateFeedback().length - 1}>
                    <ListItemText
                      primary={item.title}
                      secondary={item.content}
                      primaryTypographyProps={{ variant: 'h6' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => router.push('/')}
          >
            Start New Interview
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 