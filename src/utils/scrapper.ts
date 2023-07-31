import axios, { AxiosError } from "axios";
import * as cheerio from 'cheerio';
import { IAnimeDescription, IAnimeDetails, IAnimeType, IAnimeWeekDescription, IScrapperServce, WEB_URL } from "./scrapper.interface";
import { ANILIBRIA_URL, getTodayStrignDay, weekdays } from "../constants/constants";
import { regexFind } from "./regex.util";
import { Service } from "typedi";
import puppeteer from "puppeteer";


@Service()
export class WebScrapper implements IScrapperServce{

    getPage(url: WEB_URL): Promise<string | undefined> {
        const HTMLData = axios
        .get(url)
        .then(res => res.data)
        .catch((error: AxiosError) => {
          console.error(error.toJSON());
        });
    
      return HTMLData;
    }

    async loadPage(page: Promise<string | undefined>): Promise<cheerio.CheerioAPI>{
        const resolvedPage = await page;
        if (resolvedPage) {
          return cheerio.load(resolvedPage);
        }
        throw new Error('Failed to load page');
      
    }

    async getScheduleWeek(url: WEB_URL) : Promise<IAnimeWeekDescription[]>{
        const weekdaysGenerator = this.generateWeekdays();
        const schedules: IAnimeWeekDescription[] = [];
        const page = this.getPage(url);
        const $ = await this.loadPage(page);
        const $selected = $('table.test');
        for(const $tabel of $selected){
            const $a = $($tabel).find('td.goodcell').find('a');
            const scheduleDay: IAnimeDescription[] = [];

            for(const $link of $a){
                const $descriptions = $($link).find('div.schedule-anime-desc');
                const $image = $($link).find('img');

                const animeName = String($($descriptions).find('span.schedule-runame').text());
                const seriesMatch = $($descriptions).find('span.schedule-series').text().match(/\d+$/)
                const animeSeries = seriesMatch ? parseInt(seriesMatch[0]) : 1 ;
                const animeDescription = String($($descriptions).find('span.schedule-description').text());
                const animeImage = String($($image).attr('src'));
                const animeLink = String($($link).attr('href'));


                scheduleDay.push({
                    link: this.getFullLink(animeLink),
                    name: animeName,
                    series: isNaN(animeSeries) ? $($descriptions).find('span.schedule-series').text() : animeSeries,
                    description: animeDescription,
                    img: animeImage
                })
            }
            schedules.push({
                day: weekdaysGenerator.next().value,
                scheduleDay: scheduleDay
            })
        }

        return schedules;
    }

    async getScheduleDay(url: WEB_URL, weekDay?: string): Promise<IAnimeWeekDescription>{
        const schedules: IAnimeWeekDescription = {
            day: weekDay || getTodayStrignDay('long'),
            scheduleDay: []
        }
        const page = this.getPage(url);
        const $ = await this.loadPage(page);
        const $selected = $('table.test');
        const numToday = weekdays.indexOf(schedules.day);
        const todaySchedule = $selected[numToday];
        const $a = $(todaySchedule).find('td.goodcell').find('a');
        const scheduleDay: IAnimeDescription[] = [];

        for(const $link of $a){
            const $descriptions = $($link).find('div.schedule-anime-desc');
            const $image = $($link).find('img');

            const animeName = String($($descriptions).find('span.schedule-runame').text());
            const seriesMatch = $($descriptions).find('span.schedule-series').text().match(/\d+$/)
            const animeSeries = seriesMatch ? parseInt(seriesMatch[0]) : 1 ;
            const animeDescription = String($($descriptions).find('span.schedule-description').text());
            const animeImage = String($($image).attr('src'));
            const animeLink = String($($link).attr('href'));


            scheduleDay.push({
                link: this.getFullLink(animeLink),
                name: animeName,
                series: isNaN(animeSeries) ? $($descriptions).find('span.schedule-series').text() : animeSeries,
                description: animeDescription,
                img: this.getFullLink(url, animeImage.slice(1)),
            })
        }

        schedules.scheduleDay = scheduleDay;
        return schedules;
    }

    async parseAnimePage(url: WEB_URL): Promise<IAnimeDetails> {
        const page = this.getPage(url);
        const $ = await this.loadPage(page);
        const animeDescription = $('#xreleaseInfo').text();
        const animeDateText = $('#publicTorrentTable').find('td').eq(2).attr('data-datetime');
        const animeDate = animeDateText ? new Date(animeDateText) : new Date();
        const animeType = this.findAnimeType(animeDescription);

        return {
            detailType: animeType,
            date: animeDate
        } satisfies IAnimeDetails;
    }

    async parseCatalog(url: WEB_URL): Promise<IAnimeDescription[]>{
 
        const $ = await this.parseDynamic(url);
        const catalog: IAnimeDescription[] = [];


        $('table.simpleCatalog a').each((_, link) => {
            const $descriptions = $(link).find('div.anime_info_wrapper');
            const $image = $(link).find('img');

            const animeName = String($($descriptions).find('span.anime_name').text());
            const seriesMatch = $($descriptions).find('span.anime_number').text().match(/\d+$/)
            const animeSeries = seriesMatch ? parseInt(seriesMatch[0]) : 1 ;
            const animeDescription = String($($descriptions).find('span.anime_description').text());
            const animeImage = String($($image).attr('src'));
            const animeLink = String($(link).attr('href'));

            catalog.push({
                link: this.getFullLink(animeLink),
                name: animeName,
                series: isNaN(animeSeries) ? $($descriptions).find('span.anime_number').text() : animeSeries,
                description: animeDescription,
                img: animeImage
            })
        });

        
        return catalog;
    }

    private findAnimeType(text: string){
        const animeRegex = regexFind(text, new RegExp(`Тип:([^\n]*)`));
        const animeType = animeRegex.split(' ')[0];
        const animeTime = regexFind(animeRegex, /(\d+\s*мин)/);
        const animeCount = regexFind(animeRegex,  /(\d+\s*эп.)/)

        return {
            type: animeType.replace(',', ''),
            count: animeCount == animeRegex ? 'no info' : animeCount ,
            time: animeTime == animeRegex ? 'no info' : animeTime ,
        } as IAnimeType
    }

    private async parseDynamic(url: WEB_URL): Promise<cheerio.CheerioAPI> {
        const browser = await puppeteer.launch({ headless: true});
        const page = await browser.newPage();

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('.toggle.btn', { visible: true });
            
            await page.click('.toggle.btn');
            
            await page.waitForSelector(`.simpleCatalog`, { visible: true });
            const content = await page.content();

            return cheerio.load(content);

        } catch (error) {
            console.error('Error occurred:', error);
        } finally {
            await browser.close();
        }
        
    }

    getFullLink(animeLink: string): string {
        return ANILIBRIA_URL + animeLink
    }

    *generateWeekdays() : Generator<string> {
        for (let i = 0; i < weekdays.length; i++) {
            yield weekdays[i];
        }
    }
    
}
