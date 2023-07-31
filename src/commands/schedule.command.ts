import { Markup, Telegraf } from "telegraf";
import { Command } from "./commad.class";
import { IBotContext } from "../context/context.interface";
import { ANILIBRIA_SCHEDULE, getTodayStrignDay, getWeekDayFromShort, shortWeekdays, weekdayGenitive } from "../constants/constants";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { WebScrapper } from "../utils/scrapper";
import { IAnimeWeekDescription } from "../utils/scrapper.interface";
import { getTimeDiffString } from "../utils/date.util";
import path from "path";

export class SheduleCommand extends Command {

    private dayState = {
        active: getTodayStrignDay('short'),
        pathAssets: path.join(process.cwd(), 'src', 'assets','schedule')
    }
    
    constructor(bot: Telegraf<IBotContext>, private scrapper: WebScrapper) {
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
        const scheduleDay = await this.scrapper.getScheduleDay(ANILIBRIA_SCHEDULE, getWeekDayFromShort(this.dayState.active));

        await ctx.replyWithPhoto({ source: this.getPhotoPath()}, {
            caption: await this.createCaption(scheduleDay),
            parse_mode: 'Markdown',
            ...this.getKeyboard()
        })
        this.bot.action('schedule backward', async (ctx) => {
            this.setDayState(-1)
            const prevDay = await this.scrapper.getScheduleDay(ANILIBRIA_SCHEDULE, getWeekDayFromShort(this.dayState.active));
            this.editCaption(ctx, prevDay);
        })

        this.bot.action('schedule forward', async (ctx) => {
            this.setDayState(1)
            const nextDay = await scrapper.getScheduleDay(ANILIBRIA_SCHEDULE, getWeekDayFromShort(this.dayState.active));
            this.editCaption(ctx, nextDay);
        })

        this.bot.action(/schedule (.*)/, async (ctx) => {
            const capturedElement = ctx.match[1];
            const matchedElement = shortWeekdays.find((element) => element.toLowerCase() === capturedElement.toLowerCase());
            this.dayState.active = matchedElement || this.dayState.active;
            const daySelected = await this.scrapper.getScheduleDay(ANILIBRIA_SCHEDULE, getWeekDayFromShort(this.dayState.active));
            this.editCaption(ctx, daySelected);
        })

    }

    private async editCaption(ctx: IBotContext, animeSeries: IAnimeWeekDescription): Promise<void> {
        await ctx.editMessageMedia({ type: 'photo', media: { source: this.getPhotoPath() } });
        await ctx.editMessageCaption(await this.createCaption(animeSeries), {parse_mode: 'Markdown', ...this.getKeyboard()});
    }

    private getPhotoPath(): string{
        return path.join(this.dayState.pathAssets, `${shortWeekdays.indexOf(this.dayState.active) + 1}.jpg`) ;
    }

    private setDayState(num: number): void {
        const nextDayIndex = shortWeekdays.indexOf(this.dayState.active) + num;
        this.dayState.active = shortWeekdays[nextDayIndex];
    }

    private async createCaption(animeSeries: IAnimeWeekDescription) : Promise<string> {

        const promises = animeSeries.scheduleDay.map(async series => {
            const animeInfo = await this.scrapper.parseAnimePage(series.link);
            return `*${series.name}*` + '\n' + `${animeInfo.detailType.type == 'ТВ' ? 'Серия' : animeInfo.detailType.type} ${series.series}` + `\` ${getTimeDiffString(animeInfo.date)}\`` + "\n\n";
        });   

        return await Promise.all(promises).then(result => {
            const listAnime = result.join('');
            return `Календарь релизов на ${weekdayGenitive[shortWeekdays.indexOf(this.dayState.active)]} ` +
            `(день ${shortWeekdays.indexOf(this.dayState.active) + 1} из ${shortWeekdays.length}):` + "\n\n"
            + listAnime
            + '\n'
            + '_* Расписание не гарантирует выход серии сегодня, это лишь приблизительное время когда стоит ожидать новую серию._'

        })
    }
}