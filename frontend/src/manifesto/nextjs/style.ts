import * as Types from '@/nextjs/types'
import {getStructures} from '@/nextjs/registry'
import * as Style from '@/manifesto/style'
export * from '@/manifesto/style'

const defaultValues = getStructures() as Types.Fields;

const CSS: Types.Fields<Types.Operations> = {

    font: (value: string) => {
        return {fontFamily: 'var(--font-' + value + ')'};
    },

    bold: (value: boolean) => {
        return value ? {fontWeight: 700} : {};
    },

    italic: (value: boolean) => {
        return value ? {fontStyle: 'italic'} : {};
    },

    fontSize: (value: number) => {
        const rem = Style.pxToRem(value);
        return {fontSize: rem};
    },

    colour: (value: string) => {
        if(!value.startsWith('#')){value = defaultValues.colour! as string}
        return {color: value}},

    background: (value: string) => {return {backgroundColor: value}},

    align: (value: string) => { return {alignItems: value}},

    orientation: (value: string) => { return {flexDirection: value === 'vertical' ? 'column' : 'row'}}
} as Types.Fields<Types.Operations>

export function propsToCSS(props: Types.StyleProps): Types.CSS{
    const styleArgs = props ?? {};
    const css: Types.Fields = {};
    for(const [key, value] of Object.entries(styleArgs)){
        const typedKey = key;
        if(CSS[typedKey]){
            const cssValue = CSS[typedKey](value) as Types.Fields;
            if(cssValue && typeof cssValue === 'object' && cssValue !== null){
                const cssKey = Object.keys(cssValue)[0];
                css[cssKey] = cssValue[cssKey];
            }
        } else {
            css[typedKey] = value;
        }
    }
    return css;
} 
