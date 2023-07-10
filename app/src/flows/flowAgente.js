import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} from "@bot-whatsapp/bot";
import User from "../models/User";
import UserService from "../models/UserService";
import { v4 as uuid } from "uuid";

export const flowAgente = addKeyword(["AGENTE", "ASESOR"], { sensitive: true })
  .addAnswer("Estamos desviando tu conversación a nuestro agente")
  .addAction(async (ctx, { provider }) => {
    const refProvider = provider.getInstance();

    const user = await User.findOne({ phoneNumber: ctx.from });
    if (!user) {
      return await refProvider.groupCreate(
        `Agente ${uuid().substring(0, 4)} - GPT4BIZ`,
        [`${ctx.from}@s.whatsapp.net`]
      );
    }
    const userService = await UserService.findOne({
      user: user,
      isActive: true,
    }).populate("service");
    if (!userService) {
      return await refProvider.groupCreate(
        `Agente ${uuid().substring(0, 4)} - GPT4BIZ `,
        [`${ctx.from}@s.whatsapp.net`]
      );
    } else {
      return await refProvider.groupCreate(
        `Agente ${uuid().substring(0, 4)} - ${userService.service.name} `,
        [`${ctx.from}@s.whatsapp.net`]
      );
    }
  })
  .addAnswer("Te hemos agregado a un grupo con nuestro asesor! Gracias");
