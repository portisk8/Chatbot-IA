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
import { sendMessageToConversationAsync } from "./services/meetCodyServices";
import Service from "./models/Service";
import { flowAgente } from "./flows/flowAgente";
import UserService from "./models/UserService";
import User from "./models/User";
import { MeetCodyServiceClient } from "./services/MeetCodyServiceClient";
import Role from "./models/Role";

const flowWelcome = addKeyword([EVENTS.WELCOME]).addAnswer(
  ["Dame un minuto por favor..."],
  null,
  async (ctx, { flowDynamic, endFlow }) => {
    return flowDynamic(await sendMessageToConversationAsync(ctx.body, null));
  }
);
const flowPrincipal = addKeyword([]).addAnswer(
  ["Dame un minuto por favor..."],
  null,
  async (ctx, { flowDynamic, endFlow }) => {
    const user = await User.findOne({ phoneNumber: ctx.from });
    if (!user) {
      return flowDynamic([
        {
          body: 'Vemos que no te has vinculado a un servicio. Escribe *"MENU"* para vincularte y poder empezar a chatear.',
        },
      ]);
    } else {
      const userServiceExists = await UserService.findOne({
        user,
        isActive: true,
      }).populate("service");
      if (!userServiceExists) {
        return flowDynamic([
          {
            body: 'Vemos que no te has vinculado a un servicio. Escribe *"MENU"* para vincularte y poder empezar a chatear.',
          },
        ]);
      }
      const meetCody = new MeetCodyServiceClient(userServiceExists.service);
      const result = await meetCody.sendMessageAsync({
        text: ctx.body,
        conversationId: userServiceExists.conversationId,
      });
      if (result) {
        return flowDynamic([{ body: result.data.content }]);
      } else {
        return flowDynamic([{ body: "Lo siento intentalo nuevamente." }]);
      }
    }
  }
);

const ayudaDialog = addKeyword(["ayuda"]).addAnswer(
  ["buscando ayuda..."],
  null,
  async (ctx, { flowDynamic, endFlow }) => {
    const servicesData = await Service.find();
    let message = "Tengo los siguientes servicios:\n";
    servicesData.forEach((item, ix) => {
      message += `${ix + 1}) ${item.name}\n`;
    });
    return flowDynamic([{ body: message }]);
  }
);
const menuFlow = addKeyword(["menu"])
  .addAnswer(
    "Te presento el siguiente menú de los servicios que tengo actualmente.",
    null,
    async (ctx, { flowDynamic, endFlow }) => {
      const servicesData = await Service.find();
      let message = "";
      servicesData.forEach((item, ix) => {
        message += `*${ix + 1})* ${item.name}\n`;
      });
      return flowDynamic([{ body: message }]);
    }
  )
  .addAnswer(
    ["Ingresa el número del servicio con quien quieres comunicarte:"],
    { capture: true, buttons: [{ body: "❌ Cancelar solicitud" }] },
    async (ctx, { flowDynamic, endFlow, fallBack }) => {
      if (ctx.body == "❌ Cancelar solicitud")
        return endFlow({
          body: "❌ Su solicitud ha sido cancelada ❌",
          buttons: [{ body: "⬅️ Volver al Inicio" }],
        });

      const servicesData = await Service.find();
      if (isNaN(Number(ctx.body))) return fallBack();
      else {
        let number = Number(ctx.body);
        if (number <= 0 || servicesData.length < number) return fallBack();
        let user = await User.findOne({ phoneNumber: ctx.from });
        const roleUser = await Role.find({ name: { $in: ["user"] } });
        if (!user)
          user = await User.create({
            name: ctx.pushName,
            phoneNumber: ctx.from,
            roles: roleUser.map((role) => role._id),
          });

        let serviceSelected = servicesData[number - 1];
        await UserService.updateMany({ user }, { $set: { isActive: false } });
        let userServiceExists = await UserService.findOne({
          user,
          service: serviceSelected,
        });
        if (!userServiceExists) {
          await UserService.updateMany({ user }, { $set: { isActive: false } });
          let meetCodyServiceClient = new MeetCodyServiceClient(
            serviceSelected
          );
          let conversationResult =
            await meetCodyServiceClient.createConversationAsync(
              user,
              serviceSelected
            );
          let userServiceResult = await UserService.create({
            user,
            service: serviceSelected,
            conversationName: ctx.from,
            conversationId: conversationResult.id,
            isActive: true,
            updatedAt: new Date(),
          });
          return flowDynamic([
            {
              body: `Ya puedes chatear con el servicio de ${serviceSelected.name}`,
            },
          ]);
        } else {
          await UserService.updateOne(
            { user, service: serviceSelected },
            { $set: { isActive: true } }
          );
          return flowDynamic([
            {
              body: `Ya puedes chatear con el servicio de ${serviceSelected.name}`,
            },
          ]);
        }
      }
    }
  );

const main = async () => {
  try {
    const { default: initSetup } = await import("./database/initialSetup");
    initSetup();
  } catch (error) {}
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([
    ayudaDialog,
    flowAgente,
    menuFlow,
    flowPrincipal,
  ]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

export default main;
