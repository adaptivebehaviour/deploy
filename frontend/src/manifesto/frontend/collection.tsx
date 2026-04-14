import {Collection as SuperCollection} from '@/web/collection'
import * as Types from '@/frontend/types';
export * from '@/frontend/types';
import {getAll} from '@/frontend/registry';

export class Collection extends SuperCollection implements Types.CollectionInstance {

    constructor(args?: Types.CollectionArgs){
        const collectionArgs = {
            id: 'frontend', 
            type: 'web', 
            defaultId: 'structure',
            registry: getAll(args?.registry ?? {} as Types.Fields<Types.Fields<Types.Construct>>)
         } as Types.CollectionArgs;
        super(collectionArgs);
    }

    async fetch(arg: Types.Value): Promise<Types.Value>{

        const fetcher = this.createInstance(arg) as Types.IFetcher;
        return await fetcher.fetch();

    }
}