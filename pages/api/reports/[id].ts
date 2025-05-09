import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';

interface EmotionData {
  emotion: string;
  timestamp: string;
}

interface AnswerAnalysis {
  feedback: string;
}

interface InterviewData {
  date: string;
  type: string;
  score: number;
  duration: string;
  emotionData: EmotionData[];
  answers: { [key: number]: string };
  answerAnalysis: { [key: number]: AnswerAnalysis };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    // Mock interview data - in a real application, this would come from your database
    const interviewData: InterviewData = {
      date: '2024-03-15',
      type: 'Technical Interview',
      score: 85,
      duration: '45 minutes',
      emotionData: [
        { emotion: 'happy', timestamp: '2024-03-15T10:00:00' },
        { emotion: 'neutral', timestamp: '2024-03-15T10:05:00' },
        { emotion: 'confident', timestamp: '2024-03-15T10:10:00' }
      ],
      answers: {
        1: "I have experience with React and TypeScript, having worked on several projects...",
        2: "I follow a systematic approach to debugging, starting with reproducing the issue...",
        3: "I believe in clear communication and regular updates to keep stakeholders informed..."
      },
      answerAnalysis: {
        1: { feedback: "Good technical depth and clear explanation of experience." },
        2: { feedback: "Well-structured approach to problem-solving." },
        3: { feedback: "Strong emphasis on communication and stakeholder management." }
      }
    };

    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=interview-report-${id}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text('Interview Report', { align: 'center' });
    doc.moveDown();
    
    // Interview Details
    doc.fontSize(16).text('Interview Details', { underline: true });
    doc.fontSize(12);
    doc.text(`Date: ${interviewData.date}`);
    doc.text(`Type: ${interviewData.type}`);
    doc.text(`Score: ${interviewData.score}%`);
    doc.text(`Duration: ${interviewData.duration}`);
    doc.moveDown();

    // Emotion Analysis
    if (interviewData.emotionData && interviewData.emotionData.length > 0) {
      doc.fontSize(16).text('Emotion Analysis', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Data Points: ${interviewData.emotionData.length}`);
      
      // Calculate average emotions
      const emotionCounts: { [key: string]: number } = {};
      interviewData.emotionData.forEach((data) => {
        const emotion = data.emotion;
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });

      doc.moveDown();
      doc.text('Emotion Distribution:');
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        const percentage = ((count / interviewData.emotionData.length) * 100).toFixed(1);
        doc.text(`${emotion}: ${count} (${percentage}%)`);
      });
    }

    // Questions and Answers
    if (interviewData.answers && Object.keys(interviewData.answers).length > 0) {
      doc.moveDown();
      doc.fontSize(16).text('Questions and Answers', { underline: true });
      doc.fontSize(12);
      
      Object.entries(interviewData.answers).forEach(([questionId, answer]) => {
        const questionNumber = parseInt(questionId);
        doc.moveDown();
        doc.text(`Question ${questionId}:`);
        doc.text(answer, { indent: 20 });
        
        if (interviewData.answerAnalysis && interviewData.answerAnalysis[questionNumber]) {
          const analysis = interviewData.answerAnalysis[questionNumber];
          doc.text('Analysis:', { indent: 20 });
          doc.text(analysis.feedback, { indent: 40 });
        }
      });
    }

    // Add a footer
    doc.moveDown(2);
    doc.fontSize(10).text(
      'Generated by Interview Practice Platform',
      { align: 'center' }
    );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
} 