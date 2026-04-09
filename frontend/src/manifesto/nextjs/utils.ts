import * as Types from '@/nextjs/types';
import { Parser, Symbol } from '@/nextjs/parsing';
import { default as merge } from '@/nextjs/deepmerge';

export function value<Type extends Types.Value = Types.Value>(value?: Type | undefined) {
    return value === undefined ? null : value ?? {};
}

export function arg(args: Types.Arrayable = []) {
    return Array.isArray(args) ? args : [args];
}

export function mergeObjects<FromType, ToType>(object: FromType, args: object) {
    return merge(object, args) as ToType;
}

/** Leading lowercase letter run — shared stub for `stub`, `stub1`, `stubName`, etc. */
function propertyStub(id: string): string {
    const m = id.match(/^([a-z]+)/);
    return m ? m[1] : id;
}

export function mergeStructures(originalStructures: Types.MergeData, newStructures: Types.MergeData): Types.MergeData {

    if (!Array.isArray(originalStructures) && !Array.isArray(newStructures)) {
        const newObject: Types.StructureArg = structuredClone(originalStructures as unknown as Types.StructureArg);
        const orig = originalStructures as unknown as Types.IdField;
        const neu = newStructures as unknown as Types.IdField;
        const newID: string | undefined = hasId(newStructures) ? neu.id : (hasId(originalStructures) ? orig.id : undefined);
        if (newID) { newObject.id = newID; }
        for (const key of Object.keys(newStructures)) {
            if (key === 'content') {
                newObject[key] = newStructures[key] as Types.Value[];
            }
            else if (key === 'properties' && Object.hasOwn(newObject, key)) {
                const objectProps = newObject[key] as unknown as string[];
                const structuresProps = newStructures[key] as unknown as string[];
                const fromStructures = new Map<string, string>();
                for (const item of structuresProps) {
                    fromStructures.set(propertyStub(item), item);
                }
                const seen = new Set<string>();
                const merged: string[] = [];
                for (const item of objectProps) {
                    const stub = propertyStub(item);
                    if (seen.has(stub)) continue;
                    seen.add(stub);
                    merged.push(fromStructures.has(stub) ? fromStructures.get(stub)! : item);
                }
                for (const item of structuresProps) {
                    const stub = propertyStub(item);
                    if (!seen.has(stub)) {
                        seen.add(stub);
                        merged.push(item);
                    }
                }
                newObject.properties = merged;
            }
            else {
                if (newObject[key] === null || newStructures[key] === null) {
                    continue
                }
                if (typeof newObject[key] === 'object' && typeof newStructures[key] === 'object') {
                    const newObjectKeys = Object.keys(newObject[key] as string[]);
                    if (newObjectKeys.length === 1 && Parser.isSymbol(newObjectKeys[0], Symbol.ID)) {
                        newObject[key] = newStructures[key] as Types.Value;
                    }
                    else {
                        newObject[key] = mergeStructures(newObject[key] as Types.MergeData, newStructures[key] as Types.MergeData);
                    }
                }
                else {
                    newObject[key] = newStructures[key] as Types.Value;
                }
            }
        }
        return newObject as unknown as Types.MergeData;
    }

    const originalObjects: Types.IdFields = toFields(originalStructures as Types.Data) as Types.IdFields;
    const newObjects: Types.IdFields = toFields(newStructures as Types.Data) as Types.IdFields;
    const uniqueOriginalIds: string[] = Object.keys(newObjects).filter((id) => !Object.hasOwn(newObjects, id));
    const uniqueNewIds: string[] = Object.keys(newObjects).filter((id) => !Object.hasOwn(originalObjects, id));
    const mergedObjects: Types.IdFields = {};
    uniqueOriginalIds.forEach((id) => {
        mergedObjects[id] = structuredClone(originalObjects[id] as unknown as Types.IdField);
    });
    uniqueNewIds.forEach((id) => {
        mergedObjects[id] = structuredClone(newObjects[id] as unknown as Types.IdField);
    });
    for (const id of Object.keys(originalObjects).filter((id) => Object.hasOwn(newObjects, id))) {
        mergedObjects[id] = mergeStructures(originalObjects[id] as unknown as Types.MergeData, newObjects[id] as unknown as Types.MergeData) as unknown as Types.IdField;
    }
    return mergedObjects;
}

export function mergeDefaultStructure(defaultStructure: Types.Structures, argStructure: Types.StructureArg): Types.Structures {
    return mergeStructures(structuredClone(defaultStructure) as Types.MergeData, argStructure as Types.MergeData) as Types.Structures;
}

export function isEmpty(object: object): boolean {
    return Object.keys(object).length === 0;
}

export function hasId(structure: Types.StructureArg): boolean {
    return Object.hasOwn(structure, 'id');
}

export function checkType(type: string): boolean {
    return type === "" || !(type ?? false) || typeof type !== 'string';
}

export function getType(object: Types.StructureInstances | string): string | boolean {
    const type = typeof object === 'string' ? object : object.type as string;
    if(checkType(type)){
        return false;
    }
    const types = type.split(Symbol.PATH);
    return types[types.length - 1];
}

export function isType(object: Types.TypeField | string, ofType: string): boolean {
    if(!ofType || typeof ofType !== 'string'){
        return false;
    }
    const type: string = typeof object === 'string' ? object : object.type as string;
    if(type === "" || !(type ?? false) || typeof type !== 'string'){
        return false;
    }
    return type.split(Symbol.PATH).includes(ofType);
}

export function isArray(structures: Types.Data) {
    return Array.isArray(structures);
}

export function isObject(structures: Types.Data) {
    return !isArray(structures);
}

export function toArray<Type extends Types.StructureArg = Types.StructureArg>(structures: Types.Data<Type>) {
    return isArray(structures) ? structures : Object.values(structures);
}

export function toFields<Type extends Types.StructureArg = Types.StructureArg>(structures: Types.Data<Type>, key = 'id'): Types.Fields<Type> {
    if (isObject(structures))
        return structures as Types.Fields<Type>;
    return (structures as []).reduce((objects: Types.Fields<Type>, construct: Type) => {
        if (key in construct) {
            if (typeof construct[key] === 'string')
                objects[construct[key]] = construct;
        }
        return objects
    },
        {}) as Types.Fields<Type>;
}

export function cap(text: string) {
    return typeof text === 'string' ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function uncap(text: string) {
    return typeof text === 'string' ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

export function toId(id: string) {
    const elements = id.split(/(?=[A-Z])/);
    return elements.map((element) => element.toLowerCase()).join('-');
}

export function nextId(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-+=:;<>?*'
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function getPropFrom(propID: string, args: Types.StructureArg, defaultArg: Types.Value) {
    return [args[propID], args.content ? (args.content as unknown as Types.Fields<Types.StructureArg>)[propID] : args.content, defaultArg].filter((value) => value !== undefined)[0];
}

export function isURL(arg: string) {
    return arg.startsWith('http');
}

export function sizeRect(size: number, width: number, height: number): Types.SizeProps {
    const aspectRatio = Math.min(width, height) / Math.max(width, height);
    if (width >= height) {
        width = size;
        height = size * aspectRatio;
    } else {
        height = size;
        width = size * aspectRatio;
    }
    return { width, height };
}

