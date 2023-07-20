import { Markup, Telegraf } from "telegraf";
import { Command } from "./commad.class";
import { IBotContext } from "../context/context.interface";
import { ANILIBRIA_SCHEDULE } from "../constants/constants";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { WebScrapper } from "../utils/scrapper";
import { IAnimeWeekDescription } from "../utils/scrapper.interface";
import { getTimeDiffString } from "../utils/date.util";
import path from "path";

export class HistoryCommand extends Command {

    private countOfPage = 8;

    private historyState = {
        active: 1,
        pathAssets: path.join(process.cwd(), 'src', 'assets','history', '1.jpg')
    };
    
    constructor(bot: Telegraf<IBotContext>) {
      super(bot);
    }
  
    handle(): void {

        this.bot.command('history', ctx => {
            this.showHistory(ctx);
        })

        this.bot.hears('📖 История', ctx => {
            this.showHistory(ctx);
        });
    }

    private getKeyboard(): Markup.Markup<InlineKeyboardMarkup> {
        const isBackwardDisabled = this.historyState.active;
        const isForwardDisabled = this.historyState.active === this.countOfPage;
      
        const backwardButton = Markup.button.callback('⬅️ Назад', 'history backward');
        const forwardButton = Markup.button.callback('Вперед ➡️ ', 'history forward');
      
        const markupButtons = (isForwardDisabled || isBackwardDisabled)
          ? [isBackwardDisabled ? forwardButton : backwardButton]
          : [backwardButton, forwardButton];
      
        const numberButtons = Array.from({length: 8}, (_, i) => i + 1).map(number => {
          const buttonText = this.historyState.active === number ? `[${number}]` : String(number);
          const callbackData = `history ${number}`;
          return Markup.button.callback(buttonText, callbackData);
        });
        
        const firstHalfNumber = numberButtons.slice(0, Math.floor(this.countOfPage / 2));
        const secondHalfNumber = numberButtons.slice(Math.floor(this.countOfPage / 2));
        
            return Markup.inlineKeyboard([firstHalfNumber, secondHalfNumber, markupButtons]);
      }
      

    private async showHistory(ctx: IBotContext): Promise<void> {
        
        const scrapper = new WebScrapper();
        const catalogPage = '' // write method to parse catalog page

        await ctx.replyWithPhoto({ source: this.getPhotoPath()}, {
            caption: '123',
            parse_mode: 'Markdown',
            ...this.getKeyboard()
        })

        this.bot.action('history backward', async (ctx) => {
            // this.setHistoryState(-1)
            // const prevDay = await scrapper.getScheduleDay(ANILIBRIA_SCHEDULE, getWeekDayFromShort(this.dayState.active));
            // this.editCaption(ctx, prevDay);
        })

        this.bot.action('history forward', async (ctx) => {
            // this.setHistoryState(1)
            // const nextDay = await scrapper.getScheduleDay(ANILIBRIA_SCHEDULE, getWeekDayFromShort(this.dayState.active));
            // this.editCaption(ctx, nextDay);
        })

        this.bot.action(/history (.*)/, async (ctx) => {
            // const capturedElement = ctx.match[1];
            // const matchedElement = shortWeekdays.find((element) => element.toLowerCase() === capturedElement.toLowerCase());
            // this.dayState.active = matchedElement || this.dayState.active;
            // const daySelected = await scrapper.getScheduleDay(ANILIBRIA_SCHEDULE, getWeekDayFromShort(this.dayState.active));
            // this.editCaption(ctx, daySelected);
        })

    }
    getPhotoPath(): string {
        return this.historyState.pathAssets;
    }

    private async editCaption(ctx: IBotContext, animeSeries: IAnimeWeekDescription): Promise<void> {
        // await ctx.editMessageMedia({ type: 'photo', media: { source: this.getPhotoPath() } });
        // await ctx.editMessageCaption(await this.createCaption(animeSeries), {parse_mode: 'Markdown', ...this.getKeyboard()});
    }

    private setHistoryState(num: number): void {
        console.log()
    }

    private async createCaption(){

        // const promises = animeSeries.scheduleDay.map(async series => {
        //     const scrapper = new WebScrapper();
        //     const animeInfo = await scrapper.parseAnimePage(series.link);
        //     return `*${series.name}*` + '\n' + `${animeInfo.detailType.type == 'ТВ' ? 'Серия' : animeInfo.detailType.type} ${series.series}` + `\` ${getTimeDiffString(animeInfo.date)}\`` + "\n\n";
        // });   

        // return await Promise.all(promises).then(result => {
        //     const listAnime = result.join('');
        //     return `Календарь релизов на ${weekdayGenitive[shortWeekdays.indexOf(this.dayState.active)]} ` +
        //     `(день ${shortWeekdays.indexOf(this.dayState.active) + 1} из ${shortWeekdays.length}):` + "\n\n"
        //     + listAnime
        //     + '\n'
        //     + '_* Расписание не гарантирует выход серии сегодня, это лишь приблизительное время когда стоит ожидать новую серию._'

        // })
    }
}