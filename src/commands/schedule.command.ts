import { Markup, Telegraf } from "telegraf";
import { Command } from "./commad.class";
import { IBotContext } from "../context/context.interface";
import { getTodayStrignDay, shortWeekdays, weekdayGenitive } from "../constants/constants";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import path from "path";

export class SheduleCommand extends Command {

    private dayState = {
        active: getTodayStrignDay('short')
    }

    constructor(bot: Telegraf<IBotContext>) {
      super(bot);
    }
  
    handle(): void {

        this.bot.command('calendar', ctx => {
            this.showShelduer(ctx);
        })

        this.bot.hears('📆 Расписание', ctx => {
            this.showShelduer(ctx);
        });
    }

    private getKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
        const isBackwardDisabled = shortWeekdays.indexOf(this.dayState.active) === 0;
        const isForwardDisabled = shortWeekdays.indexOf(this.dayState.active) === shortWeekdays.length - 1;
      
        const backwardButton = Markup.button.callback('⬅️ Назад', 'schedule backward');
        const forwardButton = Markup.button.callback('➡️ Вперед', 'schedule forward');
      
        const markupButtons = (isForwardDisabled || isBackwardDisabled)
          ? [isBackwardDisabled ? forwardButton : backwardButton]
          : [backwardButton, forwardButton];
      
        const daysButtons = shortWeekdays.map(day => {
          const buttonText = this.dayState.active === day ? `[${day.toUpperCase()}]` : day.toUpperCase();
          const callbackData = `schedule ${day}`;
          return Markup.button.callback(buttonText, callbackData);
        });
      
        return Markup.inlineKeyboard([daysButtons, markupButtons]);
      }
      

    private async showShelduer(ctx: IBotContext): Promise<void> {

        await ctx.replyWithPhoto({ source: this.getPhotoPath()}, {
            caption: `Календарь релизов на ${weekdayGenitive[shortWeekdays.indexOf(this.dayState.active)]} ` +
            `(день ${shortWeekdays.indexOf(this.dayState.active) + 1} из ${shortWeekdays.length}):`,
            parse_mode: 'Markdown',
            ...this.getKeyboard()
        })
        this.bot.action('schedule backward', async (ctx) => {
            this.setDayState(-1)
            this.editCaption(ctx);
        })

        this.bot.action('schedule forward', async (ctx) => {
            this.setDayState(1)
            this.editCaption(ctx);
        })
    }

    private async editCaption(ctx: IBotContext): Promise<void> {
        await ctx.editMessageMedia({ type: 'photo', media: { source: this.getPhotoPath() } });
        await ctx.editMessageCaption(`Календарь релизов на ${weekdayGenitive[shortWeekdays.indexOf(this.dayState.active)]} ` +
        `(день ${shortWeekdays.indexOf(this.dayState.active) + 1} из ${shortWeekdays.length}):`, this.getKeyboard());
    }

    private getPhotoPath(): string{
        return path.join(process.cwd(), 'src', 'assets','schedule', `${shortWeekdays.indexOf(this.dayState.active) + 1}.jpg`);
    }

    private setDayState(num: number): void {
        const nextDayIndex = shortWeekdays.indexOf(this.dayState.active) + num;
        this.dayState.active = shortWeekdays[nextDayIndex];
    }
}