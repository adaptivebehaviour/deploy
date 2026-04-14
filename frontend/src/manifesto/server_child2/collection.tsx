import {Collection as SuperCollection} from '@/frontend/collection'
import * as Types from '@/server_child2/types';
export * from '@/server_child2/types';
import {getAll} from '@/server_child2/registry';

export class Collection extends SuperCollection implements Types.CollectionInstance {

    constructor(args?: Types.CollectionArgs){
        const collectionArgs = {
            id: 'server_child2', 
            type: 'frontend', 
            defaultId: 'structure',
            registry: getAll(args?.registry ?? {} as Types.Fields<Types.Fields<Types.Construct>>)
         } as Types.CollectionArgs;
        super(collectionArgs);
    }
}