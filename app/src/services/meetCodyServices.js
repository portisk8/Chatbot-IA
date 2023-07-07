import axios from "axios";
import CONFIG from "../config";

const { MEETCODY_URL, MEETCODY_CONVERSATION_ID, MEETCODY_KEY } = CONFIG;

export const sendMessageToConversationAsync = async (
  message,
  conversationId
) => {
  if (!conversationId) conversationId = MEETCODY_CONVERSATION_ID;

  try {
    // console.log(message);
    const response = await axios.post(
      `${MEETCODY_URL}/messages`,
      {
        content: message,
        conversation_id: conversationId,
      },
      {
        headers: {
          Authorization: "Bearer " + MEETCODY_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    if (response && response.data && response.data.data) {
      // console.log(response);
      return [{ body: response.data.data.content }];
    }
  } catch (error) {
    console.error("[SendMessageToConversationAsync] Error > ", error);
    return null;
  }
};
