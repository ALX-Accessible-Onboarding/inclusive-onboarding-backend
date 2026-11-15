const express = require('express');
const router = express.Router();

// @route   POST /api/voice/speak
// @desc    Generate Amharic audio using Gemini TTS
router.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ errors: { _: 'Gemini API key is missing on the server.' } });
    }
    if (!text || text.trim() === '') {
      return res.status(400).json({ errors: { _: 'Text is required for audio generation.' } });
    }

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }],
        generationConfig: { responseMimeType: "audio/wav" } // Request audio back
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini Error:', errorData);
      throw new Error('Gemini API failed');
    }

    const data = await response.json();
    
    // Extract audio data from Gemini response
    let audioBase64 = null;
    if (data.candidates && data.candidates[0].content.parts[0].inlineData) {
      audioBase64 = data.candidates[0].content.parts[0].inlineData.data;
    }

    if (!audioBase64) {
      throw new Error('No audio returned from Gemini');
    }

    // Convert base64 to Buffer and send as audio file
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Send audio back to the frontend
    res.set('Content-Type', 'audio/wav');
    res.send(audioBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong generating the voice.' } });
  }
});

module.exports = router;