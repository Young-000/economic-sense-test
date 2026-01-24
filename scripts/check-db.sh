#!/bin/bash
SUPABASE_URL="https://ayibvijmjygujjieueny.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aWJ2aWptanlndWpqaWV1ZW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNzE0MDUsImV4cCI6MjA4MjY0NzQwNX0.esd8HSblW4cqCtos4h4-Y5t831Pm9xK12fkGLM0rZ-Q"

curl -s "${SUPABASE_URL}/rest/v1/question_scenarios?select=id,situation,option_a_outcomes,option_b_outcomes" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Accept-Profile: economic_sense_test"
