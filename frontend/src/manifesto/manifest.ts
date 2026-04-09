import manifestFile from '../../manifest.json' assert { type: 'json' };
import * as Types from '@/manifesto/types';

class Manifest {
    
    id: string;

    type: string;

    title: string;

    description: string;

    icon: string;

    collection: string;

    content: string[];

    routes: string[];

    mode: string;

    logging: string;

    url: Types.URL;

    version: string;

    keywords: string[];

    constructor(manifest: any){
        this.id = manifest.id;
        this.type = manifest.type;
        this.title = manifest.title;
        this.description = manifest.description;
        let icon = manifest.icon;
        if(icon.startsWith('manifesto-')){
            icon = `{@cms$image?${icon}}`;
        }
        else if(!icon.startsWith('https://')){
            icon = `{@cms$icon?${icon}}`;
        }
        this.icon = icon;
        this.collection = manifest.collection;
        this.content = manifest.content;
        this.routes = manifest.routes;
        this.mode = manifest.mode;
        this.logging = typeof manifest.logging === 'string' ? { global: manifest.logging } : manifest.logging;
        this.url = manifest.url;
        this.version = manifest.version;
        this.keywords = manifest.keywords;
        
    }
}

export function getManifest(){
    return new Manifest(structuredClone(manifestFile));
}

