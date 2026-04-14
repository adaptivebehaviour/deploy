import * as Types from '@/web/types';
export * from '@/web/types';

export type URL = Types.URL & {
    frontend: string
    backend: string
};

export type ServerCollectionInstance = Types.CollectionInstance & {
    fetch(arg: Types.Value): Promise<Types.Value>
}



