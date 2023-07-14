import { Markup, Telegraf } from "telegraf";
import { Command } from "./commad.class";
import { IBotContext } from "../context/context.interface";

export class MenuCommand extends Command {
    private menuOptions = {
      open: false,
    };
  
    constructor(bot: Telegraf<IBotContext>) {
      super(bot);
    }
  
    handle(): void {
      this.bot.command('menu', (ctx) => {
        if (this.menuOptions.open) {
          this.showMenu(ctx);
          this.menuOptions.open = false;
        } else {
          this.hideMenu(ctx);
          this.menuOptions.open = true;
        }
      });
    }
  
    private showMenu(ctx: IBotContext): void {
      ctx.reply('Открыто меню бота!', Markup.keyboard([
        ['🔎 Найти', '🧰 Смотреть'],
        ['📩 Настройки уведомления'],
        ['📆 Расписание', '📖 История'],
        ['💌 Мои подписки'],
      ]).resize());
    }
  
    private hideMenu(ctx: IBotContext): void {
      ctx.reply('Меню бота скрыто!', {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    }
  }