import { config } from "dotenv";
config();

export default {
  GUSTOMGPT_API_KEY: process.env.GUSTOMGPT_API_KEY,
  PORT: process.env.PORT || 4000,
  PROJECT_ID: process.env.PROJECT_ID,
  CONVERSATION_ID: process.env.CONVERSATION_ID,
  CUSTOMGPT_API_URL: process.env.CUSTOMGPT_API_URL,
};