import * as Types from '@/nextjs/types';
import * as Utils from '@/nextjs/utils';
import { Parser, Symbol } from '@/nextjs/parsing';


export abstract class StructureInstance implements Types.StructureInstances {
    
    [key: string]: Types.Value;

    id: string;

    type: string;

    types: string[];

    constructor(args?: Types.StructureArg | string, idOrType?: string, type?: string){
        const arg: Types.StructureArg = (typeof args === 'string' ? {"id": args, type: "structure"} : (typeof args === 'object' ? args as Types.StructureArg : {id: Utils.nextId(7), type: 'structure'}));
        if(args && idOrType){
            arg.id = idOrType;
            arg.type = type || idOrType;
        }
        if(!arg.id || arg.id === "" || typeof arg.id !== 'string' || typeof arg.id === null){
            arg.id = Utils.nextId(7);
        }
        if(arg.type === "" || !(arg.type ?? false) || typeof arg.type !== 'string'){
            arg.type = "structure";
        }
        this.id = arg.id;
        this.type = arg.type;
        this.types = this.type.split(Symbol.PATH);
        this.argType = Types.ArgType.INSTANCE;
    }

    getType(){
        return Utils.getType(this);
    }

    isType(type: string){
        return Utils.isType(this, type);
    }
}

export class Structure extends StructureInstance implements Types.Structures {

    constructor(args: Types.StructureArg){
        super(args);
    }
}

export class ContentStructure extends Structure implements Types.ContentStructures {
    
    content: Types.Value[]

    constructor(args: Types.StructureArg){
        super(args);
        this.content = args.content || [];
    }

    findContent(id: string | {id?: string, type?: string}): Types.Value | undefined {
        return this.content.find((content: Types.Value) => {
            if(typeof content === 'object'){
                const field = content as Types.Fields
                if(typeof id === 'string'){
                    return field.id === id;
                }
                else{
                    return ((id as Types.Fields).id ? field.id === id.id : false) || ((id as Types.Fields).type ? field.type === id.type : false);
                }
            }
            return content === id;
        });
    }
}

export class InstanceStructure extends ContentStructure {
    instanceCreator: Types.InstanceCreator<Types.Args, Structure>;

    constructor(args: Types.StructureArg, instanceCreator: Types.InstanceCreator<Types.Args, Structure>) {
        super(args);
        this.instanceCreator = instanceCreator;
    }
}

export class Props<PropType extends Types.Fields = Types.Fields> extends ContentStructure implements Types.PropsInstance<PropType> {

    propIDs: string[];

    constructor(args: Types.StructureArg) {
        super(args);
        this.propIDs = [];
        this.setProp('id', this.id);
        this.setProp('type', this.type);
    }

    getProps() {
        const props: Types.Fields = {};
        this.propIDs.forEach((key) => {
            props[key] = this[key] instanceof Props ? (this[key] as Props).getProps() : this[key];
        });
        if(Object.hasOwn(props, 'content') && props.content !== null){
            props.content = (props as Types.ContentField).content.map((content: Types.Value) => {
                if(typeof content === 'string'){
                    if(Parser.isSymbol(content, Symbol.REF)){
                        let key = Parser.unwrap(content);
                        key = key.slice(1);
                        if(Object.hasOwn(props, key)){
                            return props[key];
                        }
                    }
                }
                return content;
            });
            props.content = (props as Types.ContentField).content.map((content: Types.Value) => {
                if(content instanceof Props){
                    return content.getProps();
                }
                return content;
            });
        }
        props.argType = Types.ArgType.PROPS;
        return props as PropType;
    }

    addProp(key: string, value: Types.Value): Types.Value {
        this[key] = value;
        if (!this.propIDs.includes(key)) {
            this.propIDs.push(key);
        }
        return this[key];
    }

    addProps(...props: Types.Fields[]): Types.Fields {
        const addedProps: Types.Fields = {};
        Object.entries(props).forEach(([key, value]) => {
            const result = this.addProp(key, value);
            if (result !== undefined) {
                addedProps[key] = result;
            }
        });
        return addedProps;
    }

    getProp(key: string): Types.Value {
        return (this.hasProp(key) ? this[key] : null) as Types.Value;
    }

    setProp(key: string, value: Types.Value) {
        return this.addProp(key, value);
    }

    setPropWithId(key: string, value: Types.IdField) {
        value.id = key
        return this.addProp(key, value);
    }

    hasProp(propKey: string): boolean {
        return this.propIDs.includes(propKey);
    }
}