export default function handler(req, res) {
  res.status(200).json({
    test: true,
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString()
  });
} 