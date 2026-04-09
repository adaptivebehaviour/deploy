import * as Types from '@/nextjs/types';
export * from '@/nextjs/types';

export type IdPanelArgs = Types.ComponentArgs & {
    logo: Types.ImageProps;
    title: Types.TextProps;
}

export type IdPanelProps = Types.ComponentProps & {
    logo: Types.ImageProps;
    title: Types.TextProps;
}

export type NavProps = Types.ComponentProps & {
    link: string;
    component: Types.ComponentArgs;
}

export type MenuProps = Types.ComponentProps & {
    anchor: Types.IconProps
    content: Types.Links[]
}

export type HeaderArgs = Types.ComponentProps & {
    logo?: string;
    title?: string;
    links?: string[];
    account?: string
}

export type HeaderProps = Types.ComponentProps & {
    logo: string;
    title: string;
    links: string[];
    account: string
}

export type WebpageProps = Types.ComponentProps & {
    header: HeaderProps;
}

export type WebCollectionInstance = Types.CollectionInstance & {
    constructPage(route?: string): Types.JSX
}

