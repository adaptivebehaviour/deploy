import * as Types from '@/nextjs/types';
export * from '@/nextjs/types';
import { Structure } from '@/nextjs/structures';
import { Component } from '@/nextjs/components';
import { getAll } from '@/nextjs/registry';
import * as Utils from '@/nextjs/utils';
import Link from 'next/link'
import { Parser, Symbol } from '@/nextjs/parsing';
import {isStyleKey} from '@/manifesto/style';

export class Factory<ArgsType extends Types.Args = Types.Args,
    ConstructType extends Types.Construct = Types.Construct,
    ProductType extends Types.Value = Types.Value> extends Structure
    implements Types.Factories<ArgsType, ConstructType, ProductType> {

    constructs: Types.Fields<ConstructType>;

    defaultId: string;

    properties: Types.Fields;

    typeKey: string;

    parser: Parser;

    constructor(structure: Types.IdField & Types.TypeField, constructs: Types.Fields<ConstructType>, defaultId: string, properties: Types.Fields = {}) {
        super(structure ?? { id: 'factory', type: 'factory'});
        this.constructs = {};
        this.addConstructs(constructs);
        this.defaultId = defaultId;
        this.properties = properties;
        this.typeKey = this.type.split('-')[0];
        this.parser = new Parser('', this as Types.Factories);
    }

    addConstructs(constructs: Types.Constructs<ConstructType>) {
        if (constructs) {
            if(Array.isArray(constructs)){
                constructs.forEach((construct) => {
                    const id = (construct as Types.Structures).id
                    this.constructs[Utils.toId(id)] = construct
                });
            }
            else if(typeof constructs === 'object'){
                Object.entries(constructs).forEach(([key, construct]) => {
                    this.constructs[key] = construct as ConstructType;
                });
            }
        }
    }

    getConstructKey(id: string): string {
        const constructId = Utils.toId(id);
        const constructKey = Object.keys(this.constructs).find((key) => {
            const plainKey = key.replace(/\d+$/, '');
            if(plainKey === constructId) 
                return key
        });
        return constructKey || constructId;
    }

    hasConstruct(id: string): boolean {
        const constructKey = this.getConstructKey(id);
        const ids = Object.keys(this.constructs);
        return ids.includes(constructKey)
    }

    getConstruct(id: string): ConstructType {
        let constructKey = this.getConstructKey(id);
        if(!this.hasConstruct(constructKey)){
            constructKey = this.getConstructKey(this.defaultId);
        }
        return this.constructs[constructKey];
    }

    getConstructFromString(args: ArgsType): ConstructType | null {
        return typeof args === 'string' ? (this.hasConstruct(args) ? this.getConstruct(args) : this.getConstruct(this.defaultId) as ConstructType) : null;
    }

    parseFactory(args: Types.FactoryArg) {
        if (typeof args === 'string') {
            if (!this.hasConstruct(args)) {
                return {
                    [this.typeKey]: this.defaultId,
                    factory: args
                }
            }
            return args
        }
        else if (typeof args === 'object') {
            if (!Object.hasOwn(args, 'factory')) {
                args.factory = this.defaultId
            }
            if (!this.hasConstruct((args.factory as string))) {
                if (!Object.hasOwn(args, this.typeKey)) {
                    args[this.typeKey] = this.defaultId
                }
                else if (!this.hasConstruct(args[this.typeKey] as string)) {
                    args[this.typeKey] = this.defaultId
                }
            }
            return args
        }
        else {
            return this.defaultId
        }
    }

    getConstructFromArgs(args: ArgsType): ConstructType {
        const constructArgs = args ?? this.defaultId as ArgsType;
        const construct = this.getConstructFromString(constructArgs);
        if (construct === null) {
            const object = typeof constructArgs === 'string' ? { factory: constructArgs } : structuredClone(args as Types.Factories);
            object.factory = object.factory || (object as Types.IdField).id || this.defaultId
            object.factory = this.parseFactory(object.factory)
            if (typeof object.factory === 'string') {
                return this.getConstruct(object.factory)
            }
            else if (Object.hasOwn(object.factory, this.typeKey)) {
                return this.getConstruct(object.factory[this.typeKey] as string)
            }
            else {
                return this.getConstruct(object.factory.factory as string)
            }
        }
        return construct;
    }

    getArgsFromParseableKey(args: Types.Fields): Types.StructureArg | null {
        let key = [...Object.keys(args)].find((key) => Parser.isParseableToken(key));
        if (key){
            const key = Object.keys(args)[0];
            const parser = this.parser.getParser(key) as Parser;
            if (!parser.isParseable) { return null; }
            const structure = parser.parsed as Types.StructureArg;
            const value = args[key];
            if(Array.isArray(value)){
                structure.content = value
                return this.parseArgs(structure as ArgsType) as Types.StructureArg;
            }
            else if(typeof value === 'object'){
                const newValue = this.getArgsFromParseableKey(value as Types.Fields) as Types.StructureArg;
                const newObject = Utils.mergeStructures(structure as Types.MergeData, (newValue ?? value) as Types.MergeData) as Types.StructureArg;
                return Parser.parseStructure(newObject, this as Types.Factories) as Types.StructureArg;
            }
            structure.content = [value as Types.Value];
            return structure;
        }
        return null;
    }

    parseStringArgs(args: string, structure: Types.StructureArg = {}): Types.Args {
        const parser = this.parser.getParser(args, structure) as Parser;
        if(parser.isParseable){
            return parser.parsed;
        }
        else { return args; }
    }

    parseArrayArgs(args: ArgsType[], structure: Types.StructureArg = {}): Types.Args {
        return args.map((item) => this.parseArgs(item, structure));
    }

    parseObjectArgs(args: Types.Fields, structure: Types.StructureArg = {}): Types.Args {
        let newArgs: Types.StructureArg | null = null;
        let newContent: Types.Value[] | null = null;
        newArgs = this.getArgsFromParseableKey(args as Types.Fields) as Types.StructureArg;
        if (newArgs !== null) { 
            return newArgs; 
        }
        newArgs = this.parser.getParser(args as Types.Fields, structure).parsed as Types.StructureArg;
        for (const [key, value] of Object.entries(args as Types.StructureArg)) {
            if (key === 'content') {
                newContent = this.parseArgs(value as ArgsType, structure) as Types.Value[];
            }
            else if(isStyleKey(key)){
                newArgs.style = Utils.mergeObjects(newArgs.style, { [key]: value });
            }
            else {
                newArgs[key] = value;
            }
        }
        if(newContent){newArgs.content = newContent;}
        return newArgs;
    }

    parseArgs(args: ArgsType, structure: Types.StructureArg = {}): Types.Args {
        if (typeof args === 'string') {
            return this.parseStringArgs(args, structure);
        }
        else if (Array.isArray(args)) {
            return this.parseArrayArgs(args as ArgsType[], structure);
        }
        else if (typeof args === 'object') {
            return this.parseObjectArgs(args as Types.Fields, structure);
        }
        return args;
    }

    construct<Type extends ProductType = ProductType>(args: ArgsType): Type {
        const parsedArgs = this.parseArgs(args) as ArgsType;
        return this.getConstructFromArgs(parsedArgs) as unknown as Type;
    }
}

export class StructureFactory extends Factory<Types.Args, Types.Structures, Types.Structures> implements Types.StructureFactories {

    constructor(constructs: Types.Fields<Types.Structures>, defaultId: string, properties: Types.Fields = {}) {
        super({ id: 'structure-factory', type: 'structure-factory' }, Utils.toFields(constructs), defaultId, properties);
    }

    hasObjectType(argsArray: Types.Args[], type: string): boolean {
        return type === 'array' ? argsArray.some((arg) => Array.isArray(arg)) : argsArray.some((arg) => typeof arg === type);
    }

    getObjectType(argsArray: Types.Args[], type: string): Types.Arrayable<Types.Args> {
        return type === 'array' ? argsArray.filter((arg) => Array.isArray(arg))[0] : argsArray.filter((arg) => typeof arg === type)[0];
    }

    mergeArgs(object: Types.Structures, args: Types.Args): Types.Structures {
        return typeof args === 'object' ? Utils.mergeObjects<Types.Structures, Types.Structures>(object, args ?? {}) as Types.Structures : object;
    }

    getConstruct(id: string): Types.Structures {
        return structuredClone(super.getConstruct(id)) as Types.Structures;
    }

    getConstructFromString(args: Types.Args): Types.Structures | null {
        if (typeof args === 'string') {
            if (this.hasConstruct(args)) {
                return super.getConstructFromString(args) as Types.Structures;
            }
            const construct = this.getConstruct('text');
            construct.content = [args];
            return construct as Types.Structures;
        }
        return null;
    }

    getConstructFromArgs(args: Types.Args): Types.Structures {
        let construct: Types.Structures | null = this.getConstructFromString(args as Types.Args);
        if (construct === null) {
            let newArgs: Types.StructureArg = structuredClone(args) as Types.StructureArg;
            if (Array.isArray(args)) {
                const arrayArgs = args as [];
                if (args.length > 1 && this.hasObjectType(arrayArgs, 'object')) {
                    const object = this.getObjectType(arrayArgs, 'object');
                    if (this.hasObjectType(arrayArgs, 'string')) {
                        const text = this.getObjectType(arrayArgs, 'string') as string;
                        newArgs = structuredClone(object) as Types.StructureArg;
                        newArgs.content = [text];
                    }
                    else if (this.hasObjectType(arrayArgs, 'array')) {
                        newArgs = structuredClone(this.getObjectType(arrayArgs, 'object') as Types.StructureArg);
                        const content = this.getObjectType(arrayArgs, 'array') as Types.Args[];
                        newArgs.content = (newArgs.content ? [newArgs.content, ...content] : [...content]) as Types.Args[];
                    }
                }
            }
            const constructData = super.getConstructFromArgs(newArgs as Types.Args);
            construct = Utils.mergeStructures(constructData as Types.MergeData, newArgs as Types.MergeData || {} ) as Types.Structures;
        }
        return construct;
    }

    applyProperties(object: Types.Structures | { properties?: string[] }): Types.Structures {
        if (!object.properties || object.properties === null) return object as Types.Structures;
        (object.properties as string[]).forEach((property: string) => {
            const propertyObject: { type: string, structure: Types.Fields } = this.properties[property] as { type: string, structure: Types.Fields };
            if (propertyObject) {
                if (propertyObject.type === 'property') {
                    object = Utils.mergeObjects(propertyObject.structure, object) as Types.Fields;
                } else {
                    const propertyType = Utils.getType(propertyObject.type) as string;
                    (object as Types.Fields)[propertyType] = propertyObject.structure;
                }
            }
        });
        delete object.properties;
        return object as Types.Structures;
    }

    construct<Type extends Types.Structures = Types.Structures>(args: Types.Args, ref?: Types.Value): Type { 
        const parsedArgs = this.parseArgs(args, ref as Types.StructureArg) as Types.Args;
        let construct: Types.Structures = this.getConstructFromArgs(parsedArgs) as Types.Structures;
        if(construct.structure){
            construct = Utils.mergeStructures(construct.structure as Types.MergeData, construct as Types.MergeData) as Types.Structures;
            delete construct.structure;
        }
        const constructed = this.applyProperties(construct as Types.Structures & { properties?: string[] }) as unknown as Type;
        constructed.content = Utils.arg(constructed.content as Types.Value);
        if (!Utils.isType(constructed as Types.TypeField, 'item')) {
            constructed.content = (constructed.content as Types.Args[]).map((content: Types.Args) => {
                return Parser.skipParsing(content, Symbol.REF) ? content : this.construct(content as Types.Args, constructed) as Types.Structures;})
        }
        for (const [key, value] of Object.entries(constructed)){
            if(key !== 'content' && key !== 'style'){
                if(typeof value === 'string' && Parser.isParseableToken(value)) {
                    (constructed as Types.Fields)[key] = Parser.isConstructableToken(value) ? this.construct(value as Types.Args) : Parser.parse(value, null, constructed);
                }
                else if(typeof value === 'object' && value !== null){
                    (constructed as Types.Fields)[key] = this.construct(value as Types.Args);
                };
            }
        }
        constructed.argType = Types.ArgType.STRUCTURE;
        return constructed as Type;
    }
}

export class InstanceFactory<ProductType extends Structure = Structure>
    extends Factory<Types.Args, Types.Constructors<Types.Args, Structure>, ProductType> implements Types.InstanceFactories<ProductType> {

    instanceCreator: Types.InstanceCreator<Types.Args, ProductType>;

    constructor(instanceCreator: Types.InstanceCreator<Types.Args, ProductType>, constructs: Types.Fields<Types.Constructors<Types.Args, ProductType>>, defaultId: string, properties: Types.Fields = {}) {
        super({ id: 'instance-factory', type: 'instance-factory' }, constructs as unknown as Types.Fields<Types.Constructors<Types.Args, Structure>>, defaultId, properties);
        this.instanceCreator = instanceCreator;
    }

    static toArgs<Type extends Structure>(constructs: Types.Fields<Types.Construct>): Types.Fields<Types.Constructors<Types.Args, Type>> {
        return constructs as unknown as Types.Fields<Types.Constructors<Types.Args, Type>>
    }

    construct<Type extends ProductType>(args: Types.Args): Type {
        let construct = this.getConstructFromArgs(args) as unknown as Types.Constructors<Types.Args, ProductType>;
        if(!(typeof construct === typeof Structure)){
            construct = Structure as unknown as Types.Constructors<Types.Args, ProductType>;
        }
        return new construct(args, this.instanceCreator) as Type;
    }
}

export class OperationFactory extends Factory<string, Types.Operations, Types.Operations> implements Types.OperationFactories {

    constructor(constructs: Types.Fields<Types.Operations>, defaultId: string, properties: Types.Fields = {}) {
        super({ id: 'operation-factory', type: 'operation-factory' },constructs, defaultId, properties );
    }

    construct<Type extends Types.Operations = Types.Operations>(args: string): Type {
        const parsedArgs = this.parseArgs(args) as string;
        return this.getConstructFromArgs(parsedArgs) as Type;
    }
} 

export class ComponentFactory<PropType extends Types.ComponentProps = Types.ComponentProps> extends Factory<PropType, Types.ComponentType, Types.JSX> implements Types.Factories<Types.ComponentProps, Types.ComponentType, Types.JSX>{

    constructor(constructs: Types.Fields<React.ComponentType> = {}, defaultId: string, properties: Types.Fields = {}){
        super({ id: 'component-factory', type: 'component-factory' }, constructs, defaultId, properties);
    }

    construct<Type extends Types.JSX = Types.JSX>(args: Types.ComponentProps): Type{
        const componentArgs = {
            props: args.props ?? args as Types.ComponentProps,
            children: args.children || [],
            index: args.index || 0
        } as Types.JSXArgs;
        const Construct = this.getConstructFromArgs(componentArgs.props as PropType);
        if (typeof Construct !== 'function') {
            return <Component key={componentArgs.index}>{componentArgs.children}</Component> as Type;
        }
        const component = <Construct key={componentArgs.index} {...componentArgs} /> as Type;
        const link = componentArgs.props?.link;
        return typeof link === 'string' ? <Link href={link as string}>{component}</Link> as Type : component as Type;
    }
}

export class Collection extends Structure implements Types.CollectionInstance, Types.InstanceCreator<Types.Args, Structure> {

    properties: Types.Fields;

    defaultId: string;

    structureFactory: Types.StructureFactories;

    instanceFactory: Types.InstanceFactories;

    operationFactory: Types.OperationFactories;

    componentFactory: Types.ComponentFactories;

    constructor(args?: Types.CollectionArgs) {

        super({id: args?.id || 'manifesto', type: args?.type || 'manifesto'});
        this.defaultId = (args?.defaultId || 'structure') as string;
        const registry = getAll(args?.registry ?? {} as Types.Fields<Types.Fields<Types.Construct>>);
        this.properties = registry.properties
        this.structureFactory = new StructureFactory(registry.structures as Types.Fields<Types.Structures>, this.defaultId, this.properties);
        this.instanceFactory = new InstanceFactory(this as Types.InstanceCreator<Types.Args, Structure>, InstanceFactory.toArgs(registry.constructors as Types.Fields<Types.Construct>), this.defaultId, this.properties);
        this.operationFactory = new OperationFactory(registry.operations as Types.Fields<Types.Operations>, "operation", this.properties);
        this.componentFactory = new ComponentFactory(registry.components as Types.Fields<Types.ComponentType>, "component", this.properties);
    }

    addStructures(structures: Types.Arrayable<Types.Structures>) {
        this.structureFactory.addConstructs(structures);
    }

    getStructure(id?: string): Types.Structures {
        return this.structureFactory.getConstruct(id || this.structureFactory.defaultId);
    }

    getStructures(): Types.Fields<Types.Structures> {
        return this.structureFactory.constructs;
    }

    createStructure(args: Types.Args): Types.Structures {
        return this.structureFactory.construct(args);
    }

    addConstructors( constructors: Types.Constructs<Types.Constructors<Types.Args, Structure>> ) {
        this.instanceFactory.addConstructs(constructors);
    }

    getConstructor(id?: string): Types.Constructors {
        return this.instanceFactory.getConstruct(id || this.instanceFactory.defaultId) as Types.Constructors;
    }

    getConstructors(): Types.Fields<Types.Constructors> {
        return this.instanceFactory.constructs as Types.Fields<Types.Constructors>;
    }

    createInstance<Type extends Structure = Structure>(args?: Types.Args): Type {
        const argsType = args ? (args as Types.StructureArg).argType || Types.ArgType.ARG : Types.ArgType.ARG;
        const structure = argsType === Types.ArgType.ARG ? this.createStructure(args || {}) : args;
        return this.instanceFactory.construct(structure as Types.Args) as Type;
    }

    addOperations(operations: Types.Constructs<Types.Operations>): void{
        this.operationFactory.addConstructs(operations)
    }

    getOperation(id?: string): Types.Operations{
        return this.operationFactory.getConstruct(id || this.operationFactory.defaultId) as Types.Operations;
    }

    getOperations(): Types.Fields<Types.Operations>{
        return this.operationFactory.constructs;
    }

    createOperation(id: string): Types.Operations{
        return this.operationFactory.construct(id);
    }

    runOperation(id: string, args: Types.Value): Types.Value | void{
        return this.createOperation(id)(this.operationFactory.hasConstruct(id) ? args : id)
    }

    addComponents(components: Types.Constructs<Types.ComponentType>): void{
        this.componentFactory.addConstructs(components);
    }

    getComponent(id?: string): Types.ComponentType{
        return this.componentFactory.getConstruct(id || this.componentFactory.defaultId) as Types.ComponentType;
    }

    getComponents(): Types.Fields<Types.ComponentType>{
        return this.componentFactory.constructs;
    }

    createProps<PropsType extends Types.ComponentProps = Types.ComponentProps>(arg1: Types.Args, arg2?: Types.Args | number): PropsType {
        if(typeof arg1 === 'object' && (arg1 as Types.PropsInstance).argType === Types.ArgType.PROPS){
            return arg1 as PropsType;
        }
        const arrayArgs: Types.Arrays<Types.Args> = Array.isArray(arg1) ? arg1 : [arg1];
        if (!Array.isArray(arg1) && arg2 && typeof arg2 !== 'number') {
            arrayArgs.push(arg2 as string | Types.ComponentStructureArg);
        }
        let instanceArgs = ((arrayArgs.length > 1 ? { content: arrayArgs } : arrayArgs[0]) || { factory: this.defaultId }) as Types.Args;
        instanceArgs = Array.isArray(instanceArgs) ? this.createProps(instanceArgs) : instanceArgs;
        const inst = this.createInstance(instanceArgs) as Types.PropsInstance;
        return inst.getProps() as PropsType;
    }

    createComponent<Type extends Types.Value = Types.JSX>(arg1: Types.Args, arg2?: Types.Args | number, index: number = 0): Type {
        const props = { ...this.createProps(arg1, arg2), index };
        return this.componentFactory.construct(props) as Type;
        
    }

    addProperty(property: Types.Structures) {
        this.properties[property.id] = property;
    }

    addCollection(collection: Types.CollectionInstance) {
        this.addStructures(Object.values(collection.getStructures()));
        this.addConstructors(collection.getConstructors() as Types.Constructs<Types.Constructors<Types.Args, Structure>>);
        this.addOperations(collection.getOperations());
        this.properties = { ...this.properties, ...collection.properties };
    }

    construct<Type extends Types.Value = Types.Value>(args: Types.Args): Types.Arrayable<Type>;
    construct<Type extends Types.JSX = Types.JSX>(arg1: Types.ComponentProps, index?: number): Type;
    construct<Type extends Types.Value = Types.Value>(arg: Types.Args, index?: number): Types.Arrayable<Type> | Type {
        let objectArg: Types.StructureArg | null = null;
        if (typeof arg === 'string') {
            objectArg = this.createStructure(arg) as Types.Structures;
        }
        if (Array.isArray(arg)) {
            return arg.map((arg) => this.construct<Type>(arg as Types.Args) as Type) as Type[];
        }
        if (typeof arg === 'object') {
            objectArg = structuredClone(arg) as Types.StructureArg
            objectArg.argType = objectArg.argType || Types.ArgType.ARG;
        }
        if(objectArg?.argType === Types.ArgType.ARG){
            objectArg = this.createStructure(objectArg) as Types.StructureArg;
        }
        let props: Types.ComponentProps | null = objectArg?.argType === Types.ArgType.PROPS ? objectArg as Types.ComponentProps : null;
        if(objectArg?.argType === Types.ArgType.STRUCTURE){
            const instance = this.createInstance(objectArg) as Types.PropsInstance;
            if(instance){
                if(instance.propIDs){ 
                    props = instance.getProps() as Types.ComponentProps;
                }
                else{
                    return instance as Type;
                }
            }
            else{
                return objectArg as Type;
            }
        }
        if(props){
            return this.createComponent(props, index ?? 0) as Type;
        }
        return objectArg as Type;
    }

}