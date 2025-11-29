// CRITICAL: Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';

// Load environment variables from .env file in project root
// dotenv.config() automatically looks for .env in process.cwd() (project root)
const result = dotenv.config();
if (result.error) {
  console.warn('⚠️  Could not load .env file:', result.error.message);
  console.log('💡 Make sure .env file exists in project root with GEMINI_API_KEY=your_key');
} else {
  console.log('✅ Environment variables loaded successfully');
  console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓' : '✗'}`);
  console.log(`   - SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✓' : '✗'}`);
  console.log(`   - GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓' : '✗'}`);
}

// Now import other modules (they can safely use process.env)
import express from 'express';
import cors from 'cors';
import generateQuestionsHandler from './api/generate-questions';
import summarizeProfileHandler from './api/summarize-profile';
import saveAssessmentHandler from './api/save-assessment';
import getAssessmentHandler from './api/get-assessment';
import statsHandler from './api/stats';
import dashboardHandler from './api/dashboard';
import transactionsHandler from './api/transactions';
import agentHandler from './api/agent';
import impulseHandler from './api/impulse';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to convert Express req/res to Vercel-style handler format
const adaptHandler = (handler: any) => {
  return async (req: express.Request, res: express.Response) => {
    // Create a Vercel-style request object
    const vercelReq = {
      method: req.method,
      body: req.body,
      query: req.query, // Add query params for GET requests
      headers: req.headers,
    } as any;

    // Track if response was sent
    let responseSent = false;

    // Create a Vercel-style response object
    const vercelRes = {
      status: (code: number) => {
        res.status(code);
        return {
          json: (data: any) => {
            if (!responseSent) {
              responseSent = true;
              res.json(data);
            }
          },
          end: () => {
            if (!responseSent) {
              responseSent = true;
              res.end();
            }
          },
        };
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
      },
      json: (data: any) => {
        if (!responseSent) {
          responseSent = true;
          res.json(data);
        }
      },
      end: () => {
        if (!responseSent) {
          responseSent = true;
          res.end();
        }
      },
    } as any;

    try {
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Handler error:', error);
      if (!responseSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
};

// API Routes
app.post('/api/generate-questions', adaptHandler(generateQuestionsHandler));
app.options('/api/generate-questions', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.post('/api/summarize-profile', adaptHandler(summarizeProfileHandler));
app.options('/api/summarize-profile', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// Database endpoints
app.post('/api/save-assessment', adaptHandler(saveAssessmentHandler));
app.options('/api/save-assessment', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.get('/api/get-assessment', adaptHandler(getAssessmentHandler));
app.options('/api/get-assessment', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.get('/api/stats', adaptHandler(statsHandler));
app.options('/api/stats', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// ========== NEW NISCHINT ENDPOINTS ==========

// Dashboard endpoint
app.get('/api/dashboard', adaptHandler(dashboardHandler));
app.options('/api/dashboard', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// Transactions endpoint (GET and POST)
app.get('/api/transactions', adaptHandler(transactionsHandler));
app.post('/api/transactions', adaptHandler(transactionsHandler));
app.options('/api/transactions', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// Agent chat endpoint
app.post('/api/agent/chat', adaptHandler(agentHandler));
app.options('/api/agent/chat', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// Impulse simulator endpoint
app.post('/api/impulse', adaptHandler(impulseHandler));
app.options('/api/impulse', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`📝 GEMINI_API_KEY: ${apiKey ? '✅ Configured' : '❌ Missing'}`);
  if (!apiKey) {
    console.log('⚠️  Make sure .env file exists in the project root with GEMINI_API_KEY=your_key');
  }
});

