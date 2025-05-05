import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import WarningIcon from '@mui/icons-material/Warning';

interface Question {
  id: number;
  text: string;
}

interface AnswerAnalysis {
  clarity: number;
  confidence: number;
  structure: number;
  keywords: string[];
  feedback: string;
}

const technicalQuestions = [
  { id: 1, text: "Can you explain your experience with the technologies mentioned in your resume?" },
  { id: 2, text: "What was the most challenging project you've worked on?" },
  { id: 3, text: "How do you handle technical disagreements in a team?" },
  { id: 4, text: "Describe a time when you had to optimize code performance." },
  { id: 5, text: "How do you stay updated with new technologies?" },
  { id: 6, text: "Explain your problem-solving approach." },
  { id: 7, text: "What's your experience with version control?" },
  { id: 8, text: "How do you ensure code quality?" },
  { id: 9, text: "Describe your experience with agile methodologies." },
  { id: 10, text: "What are your career goals in technology?" },
];

const hrQuestions = [
  { id: 1, text: "Tell me about yourself." },
  { id: 2, text: "Why did you apply for this position?" },
  { id: 3, text: "Where do you see yourself in 5 years?" },
  { id: 4, text: "What are your strengths and weaknesses?" },
  { id: 5, text: "How do you handle stress and pressure?" },
  { id: 6, text: "Describe a conflict you faced at work and how you resolved it." },
  { id: 7, text: "What's your ideal work environment?" },
  { id: 8, text: "Why should we hire you?" },
  { id: 9, text: "How do you handle feedback?" },
  { id: 10, text: "Do you have any questions for us?" },
];

export default function Interview() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [emotionData, setEmotionData] = useState<any[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [answerAnalysis, setAnswerAnalysis] = useState<{ [key: number]: AnswerAnalysis }>({});
  const recognitionRef = useRef<any>(null);
  const [faceCount, setFaceCount] = useState(0);
  const [faceWarnings, setFaceWarnings] = useState(0);
  const [noiseWarnings, setNoiseWarnings] = useState(0);
  const [showDisqualificationDialog, setShowDisqualificationDialog] = useState(false);
  const [disqualificationReason, setDisqualificationReason] = useState('');

  useEffect(() => {
    const interviewType = localStorage.getItem('interviewType') || 'technical';
    setQuestions(interviewType === 'technical' ? technicalQuestions : hrQuestions);

    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionRef.current = recognition;
    }

    // Initialize audio context for noise detection
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const initializeWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: true
        });

        if (webcamRef.current) {
          webcamRef.current.video.srcObject = stream;
          await new Promise((resolve) => {
            if (webcamRef.current?.video) {
              webcamRef.current.video.onloadedmetadata = resolve;
            }
          });
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
        // Handle webcam access error
      }
    };

    initializeWebcam();
  }, []);

  useEffect(() => {
    if (isModelLoaded && webcamRef.current) {
      let isProcessing = false;
      const interval = setInterval(async () => {
        if (isProcessing || !webcamRef.current?.video) return;
        
        try {
          isProcessing = true;
          const detections = await faceapi.detectAllFaces(
            webcamRef.current.video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 512,
              scoreThreshold: 0.5
            })
          ).withFaceExpressions();

          // Update face count
          setFaceCount(detections.length);

          // Check for multiple faces
          if (detections.length > 1) {
            setFaceWarnings(prev => {
              if (prev < 2) {
                return prev + 1;
              } else {
                setDisqualificationReason('Multiple faces detected in the frame');
                setShowDisqualificationDialog(true);
                return prev;
              }
            });
          }

          // Process emotions for the primary face
          if (detections.length > 0) {
            setEmotionData(prev => [...prev, {
              timestamp: new Date().getTime(),
              emotions: detections[0].expressions,
              questionId: currentQuestion
            }]);
          }
        } catch (error) {
          console.error('Error in face detection:', error);
        } finally {
          isProcessing = false;
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isModelLoaded, currentQuestion]);

  useEffect(() => {
    if (isRecording && audioContextRef.current && analyserRef.current) {
      const stream = webcamRef.current?.video?.srcObject as MediaStream;
      if (stream) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        const checkNoise = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            
            // If average volume is too high (background noise)
            if (average > 50) {
              setNoiseWarnings(prev => {
                if (prev < 2) {
                  return prev + 1;
                } else {
                  setDisqualificationReason('Excessive background noise detected');
                  setShowDisqualificationDialog(true);
                  return prev;
                }
              });
            }
          }
        };

        const noiseInterval = setInterval(checkNoise, 1000);
        return () => clearInterval(noiseInterval);
      }
    }
  }, [isRecording]);

  const handleDisqualification = () => {
    router.push('/');
  };

  const toggleRecording = () => {
    if (recognitionRef.current) {
      if (!isRecording) {
        recognitionRef.current.start();
        setTranscript('');
      } else {
        recognitionRef.current.stop();
        setAnswers(prev => ({
          ...prev,
          [currentQuestion]: transcript
        }));
        analyzeAnswer(transcript);
      }
      setIsRecording(!isRecording);
    }
  };

  const analyzeAnswer = (answer: string) => {
    // Simple analysis - can be enhanced with more sophisticated NLP
    const analysis: AnswerAnalysis = {
      clarity: calculateClarity(answer),
      confidence: calculateConfidence(answer),
      structure: calculateStructure(answer),
      keywords: extractKeywords(answer),
      feedback: generateFeedback(answer)
    };

    setAnswerAnalysis(prev => ({
      ...prev,
      [currentQuestion]: analysis
    }));
  };

  const calculateClarity = (answer: string): number => {
    // Simple clarity calculation based on sentence structure and length
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    return Math.min(1, avgLength / 50); // Normalize to 0-1 range
  };

  const calculateConfidence = (answer: string): number => {
    // Confidence indicators: lack of filler words, direct statements
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically'];
    const fillerCount = fillerWords.reduce((count, word) => 
      count + (answer.toLowerCase().split(word).length - 1), 0);
    return Math.max(0, 1 - (fillerCount / 10)); // Normalize to 0-1 range
  };

  const calculateStructure = (answer: string): number => {
    // Structure indicators: proper punctuation, paragraph breaks
    const punctuationCount = (answer.match(/[.!?]/g) || []).length;
    const paragraphCount = (answer.match(/\n\n/g) || []).length;
    return Math.min(1, (punctuationCount + paragraphCount) / 10);
  };

  const extractKeywords = (answer: string): string[] => {
    // Simple keyword extraction - can be enhanced with NLP
    const words = answer.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    return words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 5);
  };

  const generateFeedback = (answer: string): string => {
    const analysis = {
      clarity: calculateClarity(answer),
      confidence: calculateConfidence(answer),
      structure: calculateStructure(answer)
    };

    const feedback = [];
    
    if (analysis.clarity < 0.5) {
      feedback.push('Try to be more concise and clear in your answers.');
    }
    if (analysis.confidence < 0.5) {
      feedback.push('Work on reducing filler words and speaking more confidently.');
    }
    if (analysis.structure < 0.5) {
      feedback.push('Structure your answers better with clear points and proper transitions.');
    }

    return feedback.length > 0 
      ? feedback.join(' ') 
      : 'Good answer! You maintained clarity, confidence, and structure.';
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTranscript('');
      setIsRecording(false);
    } else {
      // Store all data and navigate to results
      localStorage.setItem('emotionData', JSON.stringify(emotionData));
      localStorage.setItem('answers', JSON.stringify(answers));
      localStorage.setItem('answerAnalysis', JSON.stringify(answerAnalysis));
      router.push('/results');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Interview
        </Typography>

        {/* Warnings */}
        {(faceWarnings > 0 || noiseWarnings > 0) && (
          <Box sx={{ mb: 2 }}>
            {faceWarnings > 0 && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 1 }}>
                Warning {faceWarnings}/2: Multiple faces detected in the frame
              </Alert>
            )}
            {noiseWarnings > 0 && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 1 }}>
                Warning {noiseWarnings}/2: High background noise detected
              </Alert>
            )}
          </Box>
        )}

        <LinearProgress 
          variant="determinate" 
          value={(currentQuestion / questions.length) * 100} 
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <Typography variant="body1">
                {questions[currentQuestion]?.text}
              </Typography>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Your Answer:
              </Typography>
              <Paper sx={{ p: 2, minHeight: 100 }}>
                {transcript || answers[currentQuestion] || 'Start speaking to record your answer...'}
              </Paper>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  onClick={toggleRecording}
                  color={isRecording ? 'secondary' : 'primary'}
                  size="large"
                >
                  {isRecording ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              </Box>
            </Box>

            {answerAnalysis[currentQuestion] && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Answer Analysis:
                </Typography>
                <Typography variant="body2">
                  {answerAnalysis[currentQuestion].feedback}
                </Typography>
              </Paper>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleNextQuestion}
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
            </Button>
          </Box>

          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Paper sx={{ p: 2 }}>
              <Webcam
                ref={webcamRef}
                mirrored
                style={{ width: '100%', borderRadius: 8 }}
                videoConstraints={{
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: 'user'
                }}
                onUserMediaError={(error) => {
                  console.error('Webcam error:', error);
                  // Handle webcam error
                }}
              />
            </Paper>
          </Box>
        </Box>

        {/* Disqualification Dialog */}
        <Dialog
          open={showDisqualificationDialog}
          onClose={handleDisqualification}
        >
          <DialogTitle>Interview Disqualified</DialogTitle>
          <DialogContent>
            <Typography>
              {disqualificationReason}. The interview has been terminated.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDisqualification} color="primary">
              Return to Home
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
} 