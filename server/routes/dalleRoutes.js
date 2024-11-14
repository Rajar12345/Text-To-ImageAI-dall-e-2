import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const router = express.Router();
//openai
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

// Test route
router.route('/').get((req, res) => {
  res.status(200).json({ message: 'Hello from Image Generation!' });
});
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      try {
        const response = await axios({
          method: 'post',
          url: 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          data: {
            inputs: prompt
          },
          responseType: 'arraybuffer'
        });

        const base64Image = Buffer.from(response.data).toString('base64');
        return res.status(200).json({ photo: base64Image });
        
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) throw error;
        await sleep(RETRY_DELAY);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.response?.data || 'Something went wrong');
  }
});

export default router;