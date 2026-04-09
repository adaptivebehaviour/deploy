
import * as Constructors from '@/web/constructors';
import * as Components from '@/web/components';
import * as Types from '@/web/types';
import * as Utils from '@/web/utils';
import structures from '@/web/structures.json' assert { type: 'json' };

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
        'id-panel': Constructors.IdPanel,
        'nav-bar': Constructors.NavBar,
        'menu': Constructors.Menu,
        'header': Constructors.Header,
        'body': Constructors.Body,
        'footer': Constructors.Footer,
        'webpage': Constructors.Webpage
    }, constructors) as Types.Fields<Types.Constructors>;
}

export function getOperations(operations: Types.Fields<Types.Operations> = {}): Types.Fields<Types.Operations> {
    return Object.assign({}, operations) as Types.Fields<Types.Operations>;
}

export function getComponents(components: Types.Fields<Types.ComponentType> = {}): Types.Fields<Types.ComponentType> {
    return Object.assign({
        'id-panel': Components.IdPanel,
        'nav-bar': Components.NavBar,
        'menu': Components.Menu,
        'header': Components.Header,
        'body': Components.Body,
        'footer': Components.Footer,
        'webpage': Components.Webpage
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

