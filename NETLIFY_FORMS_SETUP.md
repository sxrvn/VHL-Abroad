# Netlify Form Email Notifications Setup

Your forms are now configured to work with Netlify Forms! Here's how to set up email notifications:

## Automated Setup

After deployment, Netlify will automatically detect these forms:
- **footer-contact**: The "Get My Free Roadmap" form in the footer
- **consultation-request**: The "Request Free Consultation" form on the Contact page

## Setting Up Email Notifications

### Option 1: Using Netlify Dashboard (Recommended)

1. Go to your Netlify dashboard
2. Select your site: **VHL-Abroad**
3. Navigate to **Forms** in the left sidebar
4. You'll see both forms listed after the first submission
5. Click on a form name
6. Click **Settings & notifications**
7. Under **Form notifications**, click **Add notification**
8. Select **Email notification**
9. Enter the email address where you want to receive notifications (e.g., admin@vhl-abroad.com)
10. Click **Save**
11. Repeat for the other form

### Option 2: Using Netlify TOML (Already Configured)

The forms will automatically work once deployed. You just need to configure email notifications in the Netlify dashboard as described above.

## Testing Forms

1. After deployment, visit your site
2. Fill out the footer form or consultation form
3. Submit the form
4. Check Netlify Dashboard → Forms → Submissions to see if the form was received
5. Once notifications are set up, you'll receive an email for each submission

## Form Data Storage

- All form submissions are stored in **Netlify Forms** dashboard
- Each submission can be downloaded as CSV
- Free tier includes 100 submissions per month

## Email Notification Template

When someone submits a form, you'll receive an email with:
- Form name
- Submission date/time
- All form field values
- IP address of submitter

## Important Notes

- The hidden forms.html file is required for Netlify to detect your forms during build
- Forms work with JavaScript (React) because we're using the proper `name` and `data-netlify="true"` attributes
- Spam protection is enabled via honeypot field (bot-field)
- The consultation form still saves to Supabase database AND sends to Netlify Forms

## Troubleshooting

If forms don't appear in Netlify:
1. Make sure you've deployed after adding the forms
2. Check that the build was successful
3. Try submitting a form (it will appear after first submission)
4. Verify the hidden forms.html file is in the public folder

## Need Help?

- [Netlify Forms Documentation](https://docs.netlify.com/forms/setup/)
- [Form Notifications Guide](https://docs.netlify.com/forms/notifications/)
