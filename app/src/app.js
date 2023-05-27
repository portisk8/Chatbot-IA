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

const flowPrincipal = addKeyword(["hola", "ole", "alo"])
  .addAnswer("🙌 Hola bienvenido a este *Chatbot*")
  .addAnswer(["Preguntame acerca de lo que quieras conocer de META"])
  .addAnswer(
    ["Preguntame acerca de lo que quieras conocer de META"],
    { capture: true, buttons: [{ body: "❌ Cancelar solicitud" }] },

    async (ctx, { flowDynamic, endFlow }) => {
      if (ctx.body == "❌ Cancelar solicitud")
        return endFlow({
          body: "❌ Su solicitud ha sido cancelada ❌", // Aquí terminamos el flow si la condicion se comple
          buttons: [{ body: "⬅️ Volver al Inicio" }], // Y además, añadimos un botón por si necesitas derivarlo a otro flow
        });
      let nombre = ctx.body;
      console.log(nombre);
      //   let data = await sendMessage(ctx.body);
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
