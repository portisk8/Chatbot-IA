import axios from "axios";
export class MeetCodyServiceClient {
  url;
  apiKey;
  projectId;

  constructor(config) {
    this.url = config.url;
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
  }

  conversationExistsAsync = async (conversationId) => {
    try {
      const response = await axios.get(
        `${this.url}/conversations/${conversationId}`,
        {
          headers: {
            Authorization: "Bearer " + this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status == 404) return false;
      if (response.status == 200) return true;
      else return false;
    } catch (error) {
      console.log("MeetCodyServiceClient > conversationExistsAsync ", error);
      return false;
    }
  };

  createConversationAsync = async (user, service) => {
    try {
      const response = await axios.post(
        `${this.url}/conversations`,
        {
          name: user.phoneNumber,
          bot_id: service.projectId,
        },
        {
          headers: {
            Authorization: "Bearer " + this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      if (response && response.data && response.data.data)
        return response.data.data;
      else return null;
    } catch (error) {
      console.log("MeetCodyServiceClient > createConversationAsync ", error);
      return null;
    }
  };

  sendMessageAsync = async (message) => {
    try {
      const response = await axios.post(
        `${this.url}/messages`,
        {
          content: message.text,
          conversation_id: message.conversationId,
        },
        {
          headers: {
            Authorization: "Bearer " + this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      if (response && response.data) return response.data;
      else return null;
    } catch (error) {
      console.log("MeetCodyServiceClient > sendMessageAsync ", error);
      return null;
    }
  };
}
