import { config, DotenvParseOutput } from "dotenv";
import { IConfigService } from "./config.interface";
import { Service } from "typedi";

@Service()
export class ConfigService implements IConfigService{

    private config: DotenvParseOutput
    constructor(){
        const { error, parsed } = config();
        if(error){
            throw new Error("Not found file .env");
        }

        if(!parsed){
            throw new Error("Empty file .env");
        }
        
        this.config = parsed;
    }
    
    get(key: string): string {
        const result = this.config[key];

        if(!result){
            throw new Error("Not this key");
        }
        return result;
    }
}