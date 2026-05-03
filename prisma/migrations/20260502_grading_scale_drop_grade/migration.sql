-- Migration: add gradingScale to system_settings, drop grade from assessment_attempts

-- Add gradingScale column to system_settings with the default scale
ALTER TABLE "system_settings"
  ADD COLUMN "gradingScale" JSONB NOT NULL DEFAULT '[
    {"label":"A+","minPercent":90},
    {"label":"A","minPercent":85},
    {"label":"A-","minPercent":80},
    {"label":"B+","minPercent":75},
    {"label":"B","minPercent":70},
    {"label":"B-","minPercent":65},
    {"label":"C+","minPercent":60},
    {"label":"C","minPercent":55},
    {"label":"C-","minPercent":50},
    {"label":"D+","minPercent":45},
    {"label":"D","minPercent":40},
    {"label":"F","minPercent":0}
  ]';

-- Drop the grade column from assessment_attempts (computed on read from now on)
ALTER TABLE "assessment_attempts"
  DROP COLUMN IF EXISTS "grade";
