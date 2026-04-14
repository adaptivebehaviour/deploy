import * as Collection from '@/frontend/collection';
import * as Utils from '@/frontend/utils';
import * as Constructors from '@/web/constructors';
export * from '@/web/constructors';
import * as Types from '@/frontend/types';
import {getManifest} from '@/manifesto/manifest';

export class Backend extends Constructors.Fetcher {

    constructor(args: Types.FetcherArgs){
        super(args);
        this.target = (args.target || '') as string;
        this.baseUrl = args.baseUrl || (getManifest().url as Types.URL).backend;
        this.parsePath();
    }

    async fetch(): Promise<Types.Value>{
        this.parsePath();
        return this.uri !== null ? await fetch(this.uri).then(res => res.json()) : null;
    }
}