import axios from "axios";
import CONFIG from "../config";

const { CUSTOMGPT_API_URL, CONVERSATION_ID, PROJECT_ID, GUSTOMGPT_API_KEY } =
  CONFIG;

export const sendMessageToConversationAsync = async (message) => {
  try {
    console.log(message);
    const response = await axios.post(
      `${CUSTOMGPT_API_URL}/projects/${PROJECT_ID}/conversations/${CONVERSATION_ID}/messages?stream=false&lang=es`,
      {
        prompt: message,
        stream: false,
      },
      {
        headers: {
          Authorization: "Bearer " + GUSTOMGPT_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    if (response && response.data && response.data.status == "success") {
      console.log(response);
      return [{ body: response.data.data.openai_response }];
    }
  } catch (error) {
    console.log("[SendMessageToConversationAsync] Error > ", error);
  }
};
