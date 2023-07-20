import { BotCommand } from "telegraf/typings/core/types/typegram";

export const botCommands: BotCommand[] = [
    {
        command: '/menu',
        description: 'Меню бота с основными командами',
    },
    {
        command: '/play',
        description: 'Просмотр любой серии любого релиза прямо в телеграмме',
    },
    {
        command: '/find',
        description: 'Получить ссылки на скачивание торрентов, а так-же прямую ссылку серии любого релиза',
    },
    {
        command: '/calendar',
        description: 'Расписание выхода релизов',
    },
    {
        command: '/add',
        description: 'Добавить тайтл в подписки',
    },
    {
        command: '/history',
        description: 'История выхода релизов',
    }
]