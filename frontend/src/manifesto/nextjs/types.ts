import { Structure } from '@/nextjs/structures';
import { Parser } from '@/nextjs/parsing';
import * as Types from '@/manifesto/types';
export * from '@/manifesto/types';

export type Arg = Types.Value | undefined

export type Arrayable<Type extends Types.Value = Types.Value> = Type | Type[];

export type Fields<Type extends Types.Value = Types.Value> = Types.FieldType<Type>

export type Arrays<Type extends Types.Value = Types.Value> = Types.ArrayType<Type>

export type Operations<ArgsType extends Types.Value = Types.Value, ProductType extends Types.Value = Types.Value> = Types.OperationType<ArgsType, ProductType>

export type Constructors<ArgsType extends Arg = Arg, ProductType extends Types.Instance = Types.Instance> = Types.ConstructorType<ArgsType, ProductType>

export type FactoryArg = string | Types.FieldType<Arg> & {
    factory: string
    fields?: string
    id?: string
}

export enum ArgType {
    ARG = 'ARG',
    STRUCTURE = 'STRUCTURE',
    INSTANCE = 'INSTANCE',
    PROPS = 'PROPS'
}

export type StructureArg = Fields<Types.Value> & {
    id?: string
    type?: string
    structure?: Fields
    content?: Types.Value[]
    factory?: FactoryArg
    properties?: Fields | Arrays
    constructors?: Fields<Constructors>
    operations?: Fields<Operations>
    components?: Fields<Types.ComponentType>
    collection?: string
    argType?: ArgType
}

export type SubStructure<Key extends keyof StructureArg> = Types.SubType<StructureArg, Key>

export type IdField = SubStructure<'id'>

export type TypeField = SubStructure<'type'>

export type ContentField = SubStructure<'content'>

export type StructureField = SubStructure<'structure'>

export type FactoryField = SubStructure<'factory'>

export type PropertiesField = SubStructure<'properties'>

export type Data<Type extends StructureArg = StructureArg> = Fields<Type> | Types.ArrayType<Type>

export type Structures = Fields & StructureArg & IdField & TypeField

export type StructureInstances = Structures & {
    types: string[];
    getType(): string | boolean;
    isType(type: string): boolean;
}

export type TreeType = Structures & {content: TreeType[]};

export type IdFields<Type extends IdField = IdField> = Fields<Type>;

export type IdArrays<Type extends IdField = IdField> = Type[];

export type IdData<Type extends IdField = IdField> = IdFields<Type> | IdArrays<Type>;

export type MergeData = Arrayable<IdData> | Fields<IdData>

export type CollectionStructure = Structures & {
    content: IdField[]
    defaultId: string
}

export type CollectionArgs = Structures & {
    registry?: Fields<Fields<Construct>>
}

export type Definition = Structures & FactoryField & StructureField & ContentField & {properties: string[]} & {collection: string};

export type Args = Arrayable | Data | FactoryArg | FactoryField

export type Construct<ArgsType extends Args = Args, ProductType extends Types.Value = Types.Value, InstanceType extends Types.Instance = Types.Instance> = Structures | Operations<ArgsType, ProductType> | Constructors<ArgsType, InstanceType> | Types.ComponentType

export type Constructs<Type extends Construct = Construct> = Arrayable<Type> | Fields<Type>

// export type ConstructArgs = {
//     construct: Construct
//     args: Args
// }



export type Factories<ArgsType extends Args = Args, ConstructType extends Construct = Construct, ProductType extends Types.Value = Types.Value> = StructureInstances & {
    constructs: Fields<ConstructType>,
    defaultId: string,
    typeKey: string,
    parser: Parser,
    getConstructKey(id: string): string;
    getConstructFromArgs(args: ArgsType): ConstructType;
    addConstructs(constructs: Constructs<ConstructType>): void;
    hasConstruct(id: string): boolean;
    getConstruct(id: string): ConstructType;
    getConstructFromString(args: ArgsType): ConstructType | null;
    construct<Type extends ProductType = ProductType>(args: ArgsType): Type;
}

export type StructureFactories = Factories<Args, Structures, Structures> & {
    mergeArgs(construct: Structures, args: Args): Structures;
    applyProperties(structure: Structures & {properties?: string[]}): Structures;
    hasObjectType(argsArray: Args[], type: string): boolean;
    getObjectType(argArray: Args[], type: string): Arrayable<Args>;
}

export type InstanceFactories<ProductType extends Types.Instance = Types.Instance> = Factories<Args, Constructors<Args, Types.Instance>, ProductType> & {
    instanceCreator: Types.InstanceCreator<Args, ProductType>;
}

export type ContentStructures = StructureInstances & {
    content: Types.Value[]
}

export type PropsInstance<PropsType extends Fields = Fields> = StructureInstances & {
    propIDs: string[];
    getProps(): PropsType;
    addProp(key: string, value: Types.Value): Types.Value;
    addProps(...props: Fields[]): Fields;
    getProp(key: string): Types.Value;
    setProp(key: string, value: Types.Value): Types.Value;
    hasProp(propKey: string): boolean;
}

export type FetchingArgsType = StructureArg & {
    target?: Types.Value;
    schema?: string;
    baseUrl?: string;
    uri?: string;
}

export type FetchingArgs = FetchingArgsType | string;

export type FetcherProps = Structures & Required<FetchingArgsType>

export type FetcherArgs = FetcherProps & {
    parser: Parser
}

export type IFetcher = PropsInstance<FetcherProps> & {
    fetch(): Promise<Types.Value>;
}

export type OperationFactories = Factories<string, Operations, Operations> & {
}

export type ComponentFactories<ProductType extends Types.JSX = Types.JSX> = Factories<Args, Types.ComponentType, ProductType> & {
    
}

export type CollectionInstance = StructureInstances & PropertiesField & {
    // structure: Fields<Structures>;
    properties: Fields;
    defaultId: string;
    structureFactory: StructureFactories;
    instanceFactory: InstanceFactories;
    operationFactory: OperationFactories;
    componentFactory: ComponentFactories;
    addStructures(structures: Arrayable<Structures>): void;
    getStructure(id?: string): Structures;
    getStructures(): Fields<Structures>;
    addProperty(property: Structures): void;
    addConstructors( constructors: Constructs<Constructors<Args, Structure>> ): void;
    getConstructor(id?: string): Constructors
    getConstructors(): Fields<Constructors>;
    addCollection(collection: CollectionInstance): void;
    createStructure(args: Args): Structures;
    createProps(args: Args): Fields;
    createInstance<Type extends Structure = Structure>(args: Args): Type
    addOperations(operations: Constructs<Operations>): void;
    getOperation(id?: string): Operations | Fields<Operations>;
    getOperations(): Fields<Operations>;
    createOperation(id: string): Operations;
    runOperation(id: string, args: Types.Value): Types.Value | void;
    addComponents(components: Constructs<Types.ComponentType>): void;
    getComponent(id?: string): Types.ComponentType | Fields<Types.ComponentType>;
    getComponents(): Fields<Types.ComponentType>;
    createComponent<Type extends Types.Value = Types.JSX>(arg1: Args, arg2?: Args | number, index?: number): Type;
    construct<Type extends Types.Value = Types.Value>(args: Args): Arrayable<Type> | Type;
}

export type MouseEventHandler = React.MouseEventHandler<HTMLDivElement>;
export type MouseEvent = React.MouseEvent<HTMLDivElement>;
export type ChangeEventHandler = React.ChangeEventHandler<HTMLInputElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export type ClickEvent = {event: MouseEvent, object: object}

export type RadixProps = React.ComponentPropsWithoutRef<Types.ComponentType>
export type RadixRef = React.ForwardedRef<React.ComponentRef<Types.ComponentType>>

export type StyleArgs = Structures & {
    props: string[] | Fields
};

export type StyleData = Data & {
    colour?: string;
    align?: string;
    orientation?: string;
};

export type StyleProps = Fields & Required<StyleData> & {
    css: Types.CSS;
};

export type ComponentStructureArg = StructureArg & {
    style?: StyleArgs; 
    size?: number; 
    isHighlighted?: boolean;
    name?: string;
    link?: string | null;
};

export type ComponentArgs = Args | ComponentStructureArg

export type ComponentStructureType = Structures & Required<Omit<ComponentStructureArg, 'style'>> & {
    content: ComponentArgs[];
    style: StyleData;
};

export type ComponentProps = Omit<ComponentStructureType, 'content' | 'style'> & {
    content: ComponentProps[];
    style: StyleProps;
};

export interface Sizeable {
    setSize(size?: number): number;
}

export type IComponent = PropsInstance<ComponentProps> & Sizeable & {
    setPropSize(propIds: string | string[], size?: number): number | null;
    setSize(size?: number): number;
}

export type ItemArgs = ComponentArgs & {
    item?: Types.Value;
    size?: number;
}

export type ItemProps = ComponentProps & { item: Types.Value; size: number }

export type TextProps = ItemProps

export type PointArgs = {
    x?: number;
    y?: number;
    z?: number;
}

export type PointProps = Required<PointArgs>

export type SizeArgs = {
    width?: number;
    height?: number;
}

export type SizeProps = Required<SizeArgs>

export type RectArgs = PointArgs & SizeArgs

export type RectProps = PointProps & SizeProps

export type ImageArgs = ItemArgs & RectArgs & {
    alt?: string;
};

export type ImageProps = ItemProps & RectProps & { alt?: string }

export type SvgArgs = ImageArgs & {
    colour?: string,
    rect?: RectProps | null;
};

export type SvgProps = ImageProps & { colour?: string; rect?: RectProps | null }

export type IconArgs = ComponentArgs & RectArgs & {
    alt?: string;
    rect?: RectProps;
};

export type IconProps = ComponentProps & RectProps & {
    alt?: string;
    rect: RectProps;
    back: SvgProps; 
    front: SvgProps;
}

export type Children = string | Types.JSX |(Types.JSX | string)[];
export type JSXArgs<PropType extends ComponentProps = ComponentProps> = {props?: PropType | null, children?: Children, index?: string | number};

export type Links = Fields & {
    link: string;
    component: ComponentStructureType | Children;
}

export interface Rectable extends RectProps, Sizeable {
    
}

