import { Markup, Telegraf } from "telegraf";
import { Command } from "./commad.class";
import { IBotContext } from "../context/context.interface";
import { ANILIBRIA_CATALOG, ANILIBRIA_SCHEDULE } from "../constants/constants";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { WebScrapper } from "../utils/scrapper";
import { IAnimeDescription, IAnimeWeekDescription } from "../utils/scrapper.interface";
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
        const catalogPage = await scrapper.parseCatalog(ANILIBRIA_CATALOG + this.historyState.active);

        await ctx.replyWithPhoto({ source: this.getPhotoPath()}, {
            caption: await this.createCaption(catalogPage),
            parse_mode: 'Markdown',
            ...this.getKeyboard()
        })

        this.bot.action('history backward', async (ctx) => {
            this.setHistoryState(-1)
            const prevDay = await scrapper.parseCatalog(ANILIBRIA_CATALOG + this.historyState.active);
            this.editCaption(ctx, prevDay);
        })

        this.bot.action('history forward', async (ctx) => {
            this.setHistoryState(1)
            const nextDay = await scrapper.parseCatalog(ANILIBRIA_CATALOG + this.historyState.active);
            this.editCaption(ctx, nextDay);
        })

        this.bot.action(/history (.*)/, async (ctx) => {
            const capturedElement = ctx.match[1];
            const matchedElement = parseInt(capturedElement);
            this.historyState.active = matchedElement || this.historyState.active;
            const daySelected = await scrapper.parseCatalog(ANILIBRIA_CATALOG + this.historyState.active);
            this.editCaption(ctx, daySelected);
        })

    }
    getPhotoPath(): string {
        return this.historyState.pathAssets;
    }

    private async editCaption(ctx: IBotContext, animeSeries: IAnimeDescription[]): Promise<void> {
        await ctx.editMessageCaption(await this.createCaption(animeSeries), {parse_mode: 'Markdown', ...this.getKeyboard()});
    }

    private setHistoryState(num: number): void {
        this.historyState.active += num;
    }

    private async createCaption(animeSeries: IAnimeDescription[]){

        const promises = animeSeries.map(async series => {
            const scrapper = new WebScrapper();
            const animeInfo = await scrapper.parseAnimePage(series.link);
            return `*${series.name}*` + '\n' + `${animeInfo.detailType.type == 'ТВ' ? 'Серия' : animeInfo.detailType.type} ${series.series}` + `\` ${getTimeDiffString(animeInfo.date)}\`` + "\n\n";
        });   

        return await Promise.all(promises).then(result => {
            const listAnime = result.join('');
            return `История релизов (стр. ${this.historyState.active} из ${this.countOfPage}): ` + "\n\n"
            + listAnime

        })
    }
}