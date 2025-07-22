import axios from 'axios';

export default async function scoreEssay(essayText) {
  try {
    const response = await axios.post('http://127.0.0.1:5000/score', { essay: essayText });
    // The ML response is an array like [{ label: 'POSITIVE', score: 0.999 }]
    const ml = Array.isArray(response.data) ? response.data[0] : response.data;
    return {
      score: ml.score,
      feedback: ml.label
    };
  } catch (error) {
    console.error(error);
    return { error: "Scoring failed" };
  }
}