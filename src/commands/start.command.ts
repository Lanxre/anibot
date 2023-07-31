import { Markup, Telegraf } from "telegraf";
import { Command } from "./commad.class";
import { IBotContext } from "../context/context.interface";
import { WebScrapper } from "../utils/scrapper";
import { ANILIBRIA_SCHEDULE } from "../constants/constants";

export class StartCommand extends Command{

    constructor(bot: Telegraf<IBotContext>){
        super(bot);
    }

    handle(): void {
        const scrapper = new WebScrapper();

        this.bot.start(ctx => {
            ctx.reply("Данные бот представляет оптимизацию данных о аниме, данные берутся с сайта https://www.anilibria.tv/" + '\n'
                + "В разработке планируется брать информацию с других источников.",
              Markup.keyboard([
                ["🔎 Найти", "🧰 Смотреть"], ["📩 Настройки уведомления"],
                ["📆 Расписание", "📖 История "], ["💌 Мои подписки "]
              ]).resize() 
            )
        })

        this.bot.action('schedule', (ctx) => {
            ctx.reply("Выбери соответвующий пункт",
            Markup.inlineKeyboard([
                Markup.button.callback("На неделю", "scheduleWeek"),
                Markup.button.callback("На день", "scheduleDay")
              ], {columns: 1}) 
            )
        })

        this.bot.action('scheduleWeek', async (ctx) => {
            const scheduleWeek = await scrapper.getScheduleWeek(ANILIBRIA_SCHEDULE);
            ctx.reply('Рассписание на неделю:')
            scheduleWeek.map(schedule =>{ 
                ctx.reply(`${schedule.day}:`)
                schedule.scheduleDay.map(
                    anime => {
                        ctx.reply(
                             `Название: ${anime.name}` + '\n' + 
                             `Кол. серий: ${anime.series}` + '\n' +
                             `Описание: ${anime.description}` + '\n' +
                             `Ссылка: ${anime.link}` + '\n' 
                        )
                    }
                )
            })
        })

        this.bot.action('scheduleDay', async(ctx) => {
            const scheduleToday = await scrapper.getScheduleDay(ANILIBRIA_SCHEDULE);
            ctx.reply(`${scheduleToday.day}:`)
            scheduleToday.scheduleDay.map(
                anime => {
                    ctx.reply(
                         `Название: ${anime.name}` + '\n' + 
                         `Кол. серий: ${anime.series}` + '\n' +
                         `Описание: ${anime.description}` + '\n' +
                         `Ссылка: ${anime.link}` + '\n' 
                    )
                }
            )
        })
    }
    
}