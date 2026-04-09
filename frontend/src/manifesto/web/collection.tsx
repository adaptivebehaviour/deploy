import {Collection as SuperCollection} from '@/nextjs/collection'
import * as Types from '@/web/types';
export * from '@/web/types';
import {getAll} from '@/web/registry';

export class Collection extends SuperCollection implements Types.CollectionInstance {

    constructor(args?: Types.CollectionArgs){
        const collectionArgs = {
            id: 'web',  
            type: 'nextjs', 
            defaultId: 'structure',
            registry: getAll(args?.registry ?? {} as Types.Fields<Types.Fields<Types.Construct>>)
         } as Types.CollectionArgs;
        super(collectionArgs);
    }

    constructPage(route?: string): Types.JSX {
        return (route ? this.construct({"{$webpage}": {route: route}}) : this.construct("{$webpage}")) as Types.JSX;
    }
}