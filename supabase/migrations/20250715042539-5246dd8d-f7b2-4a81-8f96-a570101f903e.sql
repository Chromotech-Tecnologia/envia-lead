-- Add email sending functionality for leads

-- Create edge function to send lead emails
-- This will be created as an edge function: send-lead-email

-- Update flows table to support button avatar
ALTER TABLE flows ADD COLUMN IF NOT EXISTS button_avatar_url TEXT;