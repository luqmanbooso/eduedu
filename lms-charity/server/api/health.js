export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Charity LMS API is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
} 