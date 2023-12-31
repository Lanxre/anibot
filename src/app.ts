import { Telegraf } from "telegraf";
import { IConfigService } from "./config/config.interface";
import { IBotContext } from "./context/context.interface";
import { Command } from "./commands/commad.class";
import { StartCommand } from "./commands/start.command";
import { Container, Inject, Service } from "typedi";
import { ConfigService } from "./config/config.service";
import { botCommands } from "./constants/commands";
import LocalSession from "telegraf-session-local";
import { MenuCommand } from "./commands/menu.command";
import { WebScrapper } from "./utils/scrapper";
import { SheduleCommand } from "./commands/schedule.command";
import { HistoryCommand } from "./commands/history.command";
import 'reflect-metadata';


@Service()
class Bot{
    configSerivice: IConfigService;
    bot: Telegraf<IBotContext>;
    commands: Command[] = [];
    constructor(
        @Inject()
        public configService: ConfigService,
        private scrapper: WebScrapper
        ){
        this.configSerivice = configService;
        this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));
        this.bot.use(
            new LocalSession({database: "session.json"}).middleware()
        );
    }
    
    init(){
        this.commands = [
            new StartCommand(this.bot),
            new MenuCommand(this.bot),
            new SheduleCommand(this.bot, this.scrapper),
            new HistoryCommand(this.bot, this.scrapper)
        ]
        this.setCommands();
        this.registerCommands();
        this.bot.launch();  

    }

    setCommands(){
        this.bot.telegram.setMyCommands(botCommands)
    }

    registerCommands(){
        for(const commad of this.commands){
            commad.handle();
        }
    }
}

const bot = Container.get(Bot)  
bot.init();