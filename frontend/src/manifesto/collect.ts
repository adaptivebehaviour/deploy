import * as Collection from '@/collection/collection';
export * from '@/collection/collection';

export function collect(args?: Collection.CollectionArgs): Collection.CollectionInstance{
    return new Collection.Collection(args) as Collection.CollectionInstance;
}

