# AI Interview Feedback System

An intelligent interview preparation and feedback system built with Next.js, providing real-time feedback and analysis for interview practice sessions.

## Features

- Real-time interview practice sessions
- AI-powered feedback and analysis
- Video recording and analysis
- Performance tracking and analytics
- Email notifications
- Secure authentication
- Responsive design

## Tech Stack

- **Frontend**: Next.js, React, Material-UI, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MySQL, MongoDB
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **Video Processing**: React Webcam, Face-API.js
- **PDF Processing**: PDFKit, PDF-Parse
- **Logging**: Winston
- **Charts**: Chart.js, React-Chartjs-2

## Prerequisites

- Node.js (v14 or higher)
- MySQL
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ai-interview-feedback-system.git
   cd ai-interview-feedback-system
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

4. Set up databases:

   - Create a MySQL database named `interview_prep`
   - Ensure MongoDB is running locally or update the connection string

5. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# See .env.example for all required variables
```

## Project Structure

```
├── components/     # React components
├── contexts/      # React contexts
├── data/         # Data files and utilities
├── lib/          # Utility functions and helpers
├── pages/        # Next.js pages and API routes
├── public/       # Static files
├── scripts/      # Build and utility scripts
├── styles/       # Global styles
└── types/        # TypeScript type definitions
```

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/interview/*` - Interview session endpoints
- `/api/feedback/*` - Feedback analysis endpoints
- `/api/analytics/*` - Analytics endpoints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Material-UI for the component library
- All other open-source contributors

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/ai-interview-feedback-system](https://github.com/yourusername/ai-interview-feedback-system)
# AI-Interview-Feedback-System
# AI-Interview-Feedback-System
# AI-Interview-Feedback-System
