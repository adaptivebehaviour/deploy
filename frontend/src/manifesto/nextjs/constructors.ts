import * as Types from '@/nextjs/types';
import * as Structures from '@/nextjs/structures';
import {Parser, Symbol} from '@/nextjs/parsing';
import {getManifest} from '@/manifesto/manifest';
import * as Utils from '@/nextjs/utils';
import structuresData from '@/nextjs/structures.json' assert { type: 'json' };
import { Props } from '@/nextjs/structures';

const structures = Utils.toFields(structuresData as unknown as Types.Data<Types.StructureArg>) as Types.Fields<Types.StructureArg>;

export class Tree extends Structures.Structure implements Types.TreeType{

    content: Types.TreeType[];

    constructor(treeArgs: Types.StructureArg){
        super({id: treeArgs.id || 'tree', type: treeArgs.type || 'tree'});
        this.content = (treeArgs.content || []) as Types.TreeType[];
    }
}

export class Fetcher<PropType extends Types.FetcherProps = Types.FetcherProps> extends Structures.Props<PropType> implements Types.IFetcher{

    target: string | null;

    baseUrl: string;

    schema: string;

    uri: string | null;

    constructor(args: Types.FetcherArgs){
        args = (typeof args === 'string' ? structures[args] : (args || structures.fetcher)) as Types.FetcherArgs;
        super(args as Types.FetcherArgs);
        this.factory = this.setProp("factory", args.factory || 'fetcher') as string;
        this.target = this.setProp("target", args.target || null) as null;
        this.schema = this.setProp("schema", args.schema as string) as string;
        this.baseUrl = this.setProp("baseUrl", args.baseUrl || getManifest().url) as string;
        this.uri = this.setProp("uri", Parser.parse(this.schema, null, this)) as string | null;
    }

    parsePath() {
        this.uri = Parser.parse(Parser.wrap(this.schema), null, this.getProps()) as string;
    }

    async fetch(): Promise<Types.Value>{
        this.parsePath();
        return this.uri !== null ? await fetch(this.uri).then(res => res.json()) : null;
    }
}

export class Cms extends Fetcher {

    date: string;

    constructor(args: Types.FetcherArgs){
        super(args);
        this.date = this.setProp("date", new Date().toISOString().split('T')[0]) as string;
        this.uri = null;
    }

    async fetch(): Promise<Types.Value>{
        if(this.target !== null){
            const fetched = await super.fetch() as Types.Fields & {result: Types.Arrays<Types.TypeField>};
            return fetched?.result ? fetched.result.find((item: Types.TypeField) => item.type !== 'tag') as Types.Value : null;
        }
        return null;
    }
}

const getPropFrom = Utils.getPropFrom;

const properties = Utils.toFields(Object.values(structures).filter((item) => Utils.isType(item as Types.TypeField, 'property'))) as unknown as Types.Fields<Types.StructureArg>;

export class Layout {
    static HORIZONTAL = properties.horizontal.orientation;
    static LEFT = properties.left.align;
    static CENTER = properties.center.align;
    static RIGHT = properties.right.align;
    static VERTICAL = properties.orientation;
    static TOP = properties.top.align;
    static MIDDLE = properties.middle.align;
    static BOTTOM = properties.bottom.align;
    static TOP_LEFT = properties['top-left'].align;
    static TOP_RIGHT = properties['top-right'].align;
    static BOTTOM_LEFT = properties['bottom-left'].align;
    static BOTTOM_RIGHT = properties['bottom-right'].align;
    static JUSTIFY = properties.justify.align;
}

export class Component<PropType extends Types.ComponentProps = Types.ComponentProps> extends Props<PropType> {

    static structure: Types.Structures = structures.component as Types.Structures;

    instanceCreator: Types.InstanceCreator<Types.Args, Structures.Structure>;
    structure: Types.ComponentStructureType;
    style: Types.StyleProps
    content: Types.ComponentArgs[] | Component[];
    size: number;
    isHighlighted: boolean;
    name: string;
    factory: Types.FactoryArg;
    link: string | null;

    constructor(args: Types.ComponentArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        const structureArg = typeof args === 'string' ? structures[args] : args;
        super(structureArg as Types.Structures);
        this.instanceCreator = instanceCreator;
        this.structure = structureArg as Types.ComponentStructureType;
        this.style = this.setProp("style", Utils.getPropFrom('style', this.structure, Component.structure.style) as Types.StyleProps) as Types.StyleProps;
        this.size = this.setProp('size', Utils.getPropFrom('size', this.structure, Component.structure.size) as number) as number;
        this.isHighlighted = this.setProp('isHighlighted', Utils.getPropFrom('isHighlighted', this.structure, Component.structure.isHighlighted) as boolean) as boolean;
        this.factory = this.setProp("factory", this.structure.factory || this.structure.factory || 'component') as string;
        this.name = this.setProp("name", this.structure.name || this.structure.id || this.structure.type || this.structure.factory || this.structure.component || 'component') as string;
        this.content = this.setProp("content", this.structure.content ?? [])  as Types.ComponentArgs[];
        this.link = this.setProp("link", this.structure.link || null) as string | null;
    }

    createContent(): Types.ComponentArgs[] {
        this.content = this.content.map((content) => typeof content === 'string' && Parser.isSymbol(content, Symbol.REF) ? content : this.instanceCreator.createInstance(content));
        return this.content;
    }
 
    setPropSize(propIds: string | string[], size?: number): number {
        propIds = Utils.arg(propIds);
        size = size ?? this.size;
        Utils.arg(propIds).forEach((key) => {
            if(this[key] instanceof Component){
                (this[key] as Component).setSize(size);
            }
        })
        return size;
    }

    setContentSize(size?: number): number{
        size = size ?? this.size;
        for(const content of this.content){
            if(content instanceof Component){
                (content as Component).setSize(size);
            }
        }
        return size;
    }

    setSize(size?: number): number{
        this.size = size ?? this.size;
        return this.size;
    }
}

export class Screen<PropType extends Types.ComponentProps = Types.ComponentProps> extends Component<PropType> {
    constructor(args: Types.ComponentArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
    }
}

export class App<PropType extends Types.ComponentProps = Types.ComponentProps> extends Component<PropType> {
    constructor(args: Types.ComponentArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
    }
}

export class Page<PropType extends Types.ComponentProps = Types.ComponentProps> extends Component<PropType> {
    
    constructor(args: Types.ComponentArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
    }
}

export class Display<PropType extends Types.ComponentProps = Types.ComponentProps> extends Component<PropType> {
    constructor(args: Types.ComponentArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
    }
}

export class Panel<PropType extends Types.ComponentProps = Types.ComponentProps> extends Component<PropType> {
    constructor(args: Types.ComponentArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
    }
}

export class Item<PropType extends Types.ItemProps = Types.ItemProps> extends Component<PropType> {
    item: Types.Value;

    constructor(args: Types.ComponentArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
        const item = this.structure.item ? this.instanceCreator.createInstance(this.structure.item) : this.content[0];
        this.item = this.setProp('item', item as Types.Value) as Types.Value;
    }

    createContent(): Types.ComponentArgs[] {
        return this.content
    }
}

export class Text<PropType extends Types.TextProps = Types.TextProps> extends Item<PropType> {

    static structure: Types.Structures = structures.text as Types.Structures;

    constructor(args: Types.ItemArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        let textArgs: boolean | Types.ItemArgs = false
        if(typeof args === 'string'){
            const text = structuredClone(structures.text);
            text.content = [args];
            textArgs = text;
        }
        super(textArgs || args, instanceCreator);
        this.setSize();
        this.style.fontSize = this.structure.fontSize || this.structure.size || structures.text.size;
    }

    setSize(size?: number): number{
        super.setSize(size);
        this.style.fontSize = this.size;
        return this.size;
    }
}

export class Image<PropType extends Types.ImageProps = Types.ImageProps> extends Item<PropType> implements Types.Rectable {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    alt: string;

    constructor(args: Types.ImageArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
        const structure = structures.image;
        this.x = this.setProp('x', getPropFrom('x', this.structure, structure.x) as number) as number;
        this.y = this.setProp('y', getPropFrom('y', this.structure, structure.y) as number) as number;
        this.z = this.setProp('z', getPropFrom('z', this.structure, structure.z) as number) as number;
        this.width = this.setProp('width', getPropFrom('width', this.structure, structure.width) as number) as number;
        this.height = this.setProp('height', getPropFrom('height', this.structure, structure.height) as number) as number;
        this.alt = this.setProp('alt', getPropFrom('alt', this.structure, structure.alt) as string) as string;
        this.setSize();
    }

    setSize(size?: number): number{
        super.setSize(size);
        const {width, height} = Utils.sizeRect(this.size, this.width, this.height);
        this.width = width;
        this.height = height;
        return this.size;
    }
}

export class Svg<PropType extends Types.SvgProps = Types.SvgProps> extends Image<PropType> {
    colour: string;
    rect: Types.RectProps | null;
    
    constructor(args: Types.SvgArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
        const structure = structures.svg;
        this.colour = this.setProp('colour', this.structure.style?.colour || structure.colour) as string;
        this.rect = this.setProp('rect', this.structure.rect || null) as Types.RectProps | null;
    }
}

export class Icon<PropType extends Types.IconProps = Types.IconProps> extends Component<PropType> implements Types.Sizeable {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    rect: Types.RectProps;
    alt: string;
    back: Svg;
    front: Svg;
    
    constructor(args: Types.IconArgs, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        
        super(args, instanceCreator);
        const structure = structures.icon;
        this.x = this.setProp('x', getPropFrom('x', this.structure, structure.x) as number) as number;
        this.y = this.setProp('y', getPropFrom('y', this.structure, structure.y) as number) as number;
        this.z = this.setProp('z', getPropFrom('z', this.structure, structure.z) as number) as number;
        this.width = this.setProp('width', getPropFrom('width', this.structure, structure.width) as number) as number;
        this.height = this.setProp('height', getPropFrom('height', this.structure, structure.height) as number) as number;
        this.setSize();
        this.rect = this.setProp('rect', this.structure.rect) as Types.RectProps;
        this.alt = this.setProp('alt', getPropFrom('alt', this.structure, structure.alt) as string) as string;
        let content = [this.content.length === 2 ? this.content[0] : structure.content![0], this.content.length === 1 ? this.content[0] : this.content[1] || structure.content![1]]
        content = ['back', 'front'].map((item, index) => {
            if(typeof content[index] === 'object' && content[index] !== null){
                if(Utils.isType(content[index] as Types.TypeField, 'fetcher')){
                    const itemStructure = structuredClone(this.structure[item] ?? structure[item]) as Types.SvgProps
                    itemStructure!.item = content[index]
                    return itemStructure
                }
            } 
            return this.structure[item]
        })
        this.back = this.setProp('back', this.instanceCreator.createInstance(content[0]) || null) as Svg;
        this.front = this.setProp('front', this.instanceCreator.createInstance(content[1]) || null) as Svg;
        this.content = structure.content ?? []
        this.setSize();
    }

    setSize(size?: number): number{
        this.size = size ?? this.size;
        const {width, height} = Utils.sizeRect(this.size, this.width, this.height);
        this.width = width;
        this.height = height;
        this.setPropSize(['back', 'front'], this.size);
        return this.size;
    }

    setPropSize(propIds: string | string[], size?: number): number{
        size = size ?? this.size;
        Utils.arg(propIds).forEach((key) => {
            this.setSvgSize(key);
        })
        return size;
    }

    setSvgSize(id: string): number {
        const svg = this[id] as Svg;
        if(svg?.rect){
            const max = Math.max(this.rect.width, this.rect.height);
            svg.x = this.size * (svg.rect.x / max);
            svg.y = this.size * (svg.rect.y / max);
            svg.width = this.size * (svg.rect.width / max);
            svg.height = this.size * (svg.rect.height / max);
            svg.size = Math.max(svg.width, svg.height);
        }
        return svg?.size ?? this.size;
    }
}

export class FormField<PropType extends Types.ComponentProps = Types.ComponentProps> extends Component<PropType> {
        
    label: Text | null;
    name: string;
    placeholder: string;
    isRequired: boolean;
    input: string;

    constructor(args: Types.ComponentArgs | string, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
        this.label = this.structure.label === '' ? null : this.structure.label as Text;
        const labelStructure = (this.label !== null && typeof this.structure.label === 'string') ? Utils.mergeDefaultStructure(Text.structure, {
            id: 'label',
            content: [this.structure.label]
        }) : this.label as unknown as Types.TextProps;
        this.label = this.label !== null ? this.setProp('label',this.instanceCreator.createInstance(labelStructure) || null) as Text : this.label;
        this.name = this.setProp('name', this.structure.name || this.label || 'field') as string;
        if(this.name === 'field' && this.label){
            this.name = this.label.content[0] as string;
        }
        this.placeholder = this.setProp('placeholder', this.structure.placeholder || '') as string;
        this.isRequired = this.setProp('isRequired', this.structure.isRequired || false) as boolean;
        this.input = this.setProp('input', this.structure.input || 'text') as string;
    }
}

// export class EmailField<PropType extends Types.ComponentProps = Types.ComponentProps> extends FormField<PropType> {

//     constructor(args: Types.ComponentArgs | string, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
//         super(args, instanceCreator);
//         this.placeholder = this.setProp('placeholder', this.structure.placeholder || 'email@domain.com') as string;
//     }
// }

export class Submit<PropType extends Types.ComponentProps = Types.ComponentProps> extends Component<PropType> {
    constructor(args: Types.ComponentArgs | string, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
    }
}

export class Form<PropType extends Types.ComponentProps = Types.ComponentProps> extends Component<PropType> {
    submit: Submit;
    operation: string;
    constructor(args: Types.ComponentArgs | string, instanceCreator: Types.InstanceCreator<Types.Args, Component>) {
        super(args, instanceCreator);
        this.submit = this.setProp('submit', this.structure.submit) as Submit;
        this.operation = this.setProp('operation', this.structure.operation) as string;
    }
}

