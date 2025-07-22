import axios from 'axios';

export default async function scoreEssay(essayText) {
  try {
    const response = await axios.post('http://127.0.0.1:5000/score', { essay: essayText });
    return response.data;
  } catch (error) {
    console.error(error);
    return { error: "Scoring failed" };
  }
}