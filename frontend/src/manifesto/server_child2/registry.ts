
import * as Constructors from '@/server_child2/constructors';
import * as Components from '@/server_child2/components';
import * as Types from '@/server_child2/types';
import * as Utils from '@/server_child2/utils';
import structures from '@/server_child2/structures.json' assert { type: 'json' };

export function getStructures(structuresArg?: Types.Data<Types.IdField>): Types.Fields<Types.StructureArg> {
    const content = structures.filter((item) => !Utils.isType(item as Types.TypeField, 'property')) as unknown as Types.Data<Types.StructureArg>
    let fields: Types.MergeData[] = [Utils.toFields(content) as Types.MergeData, Utils.toFields(structuresArg ?? {}) as Types.MergeData];
    return Utils.mergeStructures(fields[0], fields[1]) as Types.Fields<Types.StructureArg>;
}

export function getProperties(structuresArg?: Types.Data<Types.IdField>): Types.Fields<Types.StructureArg> {
    const content = structures.filter((item) => Utils.isType(item as Types.TypeField, 'property')) as unknown as Types.Data<Types.StructureArg>
    let fields: Types.MergeData[] = [Utils.toFields(content) as Types.MergeData, Utils.toFields(structuresArg ?? {}) as Types.MergeData];
    return Utils.mergeStructures(fields[0], fields[1]) as Types.Fields<Types.StructureArg>;
}

export function getConstructors(constructors: Types.Fields<Types.Constructors> = {}): Types.Fields<Types.Constructors> {
    return Object.assign({

    }, constructors) as Types.Fields<Types.Constructors>;
}

export function getOperations(operations: Types.Fields<Types.Operations> = {}): Types.Fields<Types.Operations> {
    return Object.assign({}, operations) as Types.Fields<Types.Operations>;
}

export function getComponents(components: Types.Fields<Types.ComponentType> = {}): Types.Fields<Types.ComponentType> {
    return Object.assign({

    }, components) as Types.Fields<Types.ComponentType>;
}

export function getAll(registry: Types.Fields<Types.Fields<Types.Construct>> = {}): Types.Fields<Types.Fields<Types.Constructs>> {

    return {
        'structures': getStructures(registry.structures as Types.Data<Types.IdField>),
        'properties': getProperties(registry.properties as Types.Data<Types.IdField>),
        'constructors': getConstructors(registry.constructors as Types.Fields<Types.Constructors>),
        'operations': getOperations(registry.operations as Types.Fields<Types.Operations>),
        'components': getComponents(registry.components as Types.Fields<Types.ComponentType>)
    } as Types.Fields<Types.Fields<Types.Constructs>>;

}

