import { Context } from "telegraf";

export interface SessionData{
    animeID: number;
}

export interface IBotContext extends Context{
    session: SessionData;
}