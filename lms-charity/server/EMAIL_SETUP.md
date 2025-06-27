# Email Setup Instructions

## Using Gmail SMTP

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in the EMAIL_PASS field

3. **Update your .env file**:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=EduCharity <your-email@gmail.com>
   ```

## Alternative Email Services

### Using SendGrid
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=EduCharity <noreply@yourdomain.com>
```

### Using Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=EduCharity <your-email@outlook.com>
```

## Testing

1. Start your server with the email configuration
2. Try the forgot password flow from the frontend
3. Check that emails are being sent successfully
4. Monitor the server console for any email errors

## Security Notes

- Never commit your real email credentials to version control
- Use environment variables for all sensitive data
- Consider using a dedicated email service for production (SendGrid, Mailgun, etc.)
- App passwords are more secure than regular passwords for Gmail
