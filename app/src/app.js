import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} from "@bot-whatsapp/bot";

import QRPortalWeb from "@bot-whatsapp/portal";
import BaileysProvider from "@bot-whatsapp/provider/baileys";
import MockAdapter from "@bot-whatsapp/database/mock";
import { sendMessageToConversationAsync } from "./services/customGPTServices";

const flowPrincipal = addKeyword([""])
  // .addAnswer("🙌 Hola bienvenido a este *Chatbot*")
  // .addAnswer(["Preguntame acerca de lo que quieras conocer de META"])
  .addAnswer(
    ["buscando..."],
    null,

    async (ctx, { flowDynamic, endFlow }) => {
      return flowDynamic(await sendMessageToConversationAsync(ctx.body));
    }
  );

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

export default main;
