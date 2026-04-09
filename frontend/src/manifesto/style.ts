import { Poppins, Merriweather, Roboto_Mono, Figtree, Quicksand } from 'next/font/google'

export const sans = Poppins({ weight: ['400', '700'], subsets: ['latin'], display: 'swap', fallback: ['system-ui'], variable: '--font-sans' })

export const serif = Merriweather({weight: ['400', '700'], subsets: ['latin'], display: 'swap', fallback: ['system-ui'], variable: '--font-serif' })

export const mono = Roboto_Mono({ weight: ['400', '700'], subsets: ['latin'], display: 'swap', fallback: ['system-ui'], variable: '--font-mono' })

export const ui = Figtree({ weight: ['400', '700'], subsets: ['latin'], display: 'swap', fallback: ['system-ui'], variable: '--font-ui' })

export const id = Quicksand({ weight: ['500', '700'], subsets: ['latin'], display: 'swap', fallback: ['system-ui'], variable: '--font-id' })

export function pxToRem(value: number): string {
    let val = (value / 16).toFixed(4);
    while(val.endsWith("0")){
        val = val.slice(0, -1);
    }
    if(val.endsWith(".")){
        val = val.slice(0, -1);
    }
    return val + "rem";
}

export const styleKeys = ['font', 'bold', 'italic', 'fontSize', 'colour', 'background', 'align', 'orientation'];

export function isStyleKey(key: string): boolean {
    return styleKeys.includes(key);
}
