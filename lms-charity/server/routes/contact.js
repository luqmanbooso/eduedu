import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import { protect } from '../middleware/auth.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// POST /api/contact - logged-in users only
router.post('/', protect, async (req, res) => {
  const { subject, message, type } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required.' });
  }
  const contact = await ContactMessage.create({
    user: req.user._id,
    name: req.user.name,
    email: req.user.email,
    subject,
    message,
    type
  });
  res.status(201).json({ message: 'Message sent!', contact });
});

// GET /api/contact - admin only
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only.' });
  const messages = await ContactMessage.find().populate('user', 'name email');
  res.json(messages);
});

// DELETE /api/contact/:id - admin only (reject/delete message)
router.delete('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only.' });
  const { id } = req.params;
  await ContactMessage.findByIdAndDelete(id);
  res.json({ message: 'Message deleted.' });
});

// POST /api/contact/:id/reply - admin only
router.post('/:id/reply', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only.' });
  const { id } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Reply message is required.' });
  const contact = await ContactMessage.findById(id);
  if (!contact) return res.status(404).json({ message: 'Contact message not found.' });
  const toEmail = contact.email || (contact.user && contact.user.email);
  if (!toEmail) return res.status(400).json({ message: 'No email found for this user.' });
  // Compose Udemy-style email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #a435f0 0%, #6a11cb 100%); padding: 30px; text-align: center; color: white; border-radius: 10px;">
        <h1 style="margin: 0; font-size: 28px;">EduCharity Support</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">We've replied to your message!</p>
      </div>
      <div style="padding: 30px 20px; background: #f8f9fa; margin: 20px 0; border-radius: 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${contact.name || 'there'},</h2>
        <p style="color: #666; line-height: 1.6;">Thank you for reaching out to EduCharity. Our admin team has replied to your message:</p>
        <div style="background: #fff; border-left: 4px solid #a435f0; padding: 20px; margin: 20px 0; border-radius: 8px; color: #222;">
          <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="color: #666;">If you have further questions, just reply to this email or contact us again through the platform.</p>
        <p style="color: #666; margin-top: 30px;">Best regards,<br><strong>The EduCharity Team</strong></p>
      </div>
      <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">This is an automated message from EduCharity. Please do not reply directly to this email.</div>
    </div>
  `;
  try {
    await sendEmail(toEmail, `Reply from EduCharity Support: ${contact.subject}`, html);
    res.json({ message: 'Reply sent successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reply email.', error: err.message });
  }
});

export default router; 