import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

// --- 1. SET UP CLIENTS ---
// We will replace these with secure environment variables in Render
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
const FIREFLIES_API_KEY = 'YOUR_FIREFLIES_API_KEY_HERE';

// In a real call, you'll get this from an API call to start the meeting
const webSocketUrl = 'wss://api.fireflies.ai/ws/v1?token=' + FIREFLIES_API_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Supabase client initialized.');

// --- 2. CONNECT TO FIREFLIES WEBSOCKET ---
console.log('Attempting to connect to Fireflies WebSocket...');
const ws = new WebSocket(webSocketUrl);

ws.on('open', () => {
  console.log('Successfully connected to Fireflies WebSocket!');

  // This is an example of what you'd send to start transcription
  // You'll need to customize this based on Fireflies docs
  const startMessage = {
    action: 'start_transcription',
    meeting_id: 'your-meeting-id', // This needs to be dynamic
    // ... other params
  };
  // ws.send(JSON.stringify(startMessage));
});

ws.on('message', async (data) => {
  try {
    const transcriptData = JSON.parse(data.toString());

    // Log the received data
    console.log('Received transcript snippet:', transcriptData);

    // --- 3. PUSH DATA TO SUPABASE ---
    // Assuming you have a table named 'live_transcripts'
    const { data: dbData, error } = await supabase
      .from('live_transcripts')
      .insert({ 
        meeting_id: 'your-meeting-id', // This should be dynamic
        transcript: transcriptData.transcript,
        speaker: transcriptData.speaker,
        timestamp: new Date()
      });

    if (error) {
      console.error('Error saving to Supabase:', error.message);
    } else {
      console.log('Successfully saved to Supabase.');
    }

  } catch (err) {
    console.error('Error processing message:', err.message);
  }
});

ws.on('close', () => {
  console.log('Disconnected from Fireflies WebSocket. Attempting to reconnect...');
  // In a real app, you'd add reconnection logic here
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err.message);
});
