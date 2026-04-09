import * as Structures from '@/nextjs/structures';
import * as Constructors from '@/nextjs/constructors';
import * as Components from '@/nextjs/components';
import * as Operations from '@/nextjs/operations';
import * as Actions from '@/nextjs/actions';
import * as Types from '@/nextjs/types';
import * as Utils from '@/nextjs/utils';
import structures from '@/nextjs/structures.json' assert { type: 'json' };

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
        'structure': Structures.Structure,
        'tree': Constructors.Tree,
        'fetcher': Constructors.Fetcher,
        'cms': Constructors.Cms,
        'component': Constructors.Component,
        'screen': Constructors.Screen,
        'app': Constructors.App,
        'page': Constructors.Page,
        'display': Constructors.Display,
        'panel': Constructors.Panel,
        'item': Constructors.Item,
        'text': Constructors.Text,
        'image': Constructors.Image,
        'svg': Constructors.Svg,
        'icon': Constructors.Icon,
        'form-field': Constructors.FormField,
        'submit': Constructors.Submit,
        'form': Constructors.Form
    }, constructors) as Types.Fields<Types.Constructors>;
}

export function getOperations(operations: Types.Fields<Types.Operations> = {}): Types.Fields<Types.Operations> {
    return Object.assign({
        'operation': Operations.operation as Types.Operations,
        'click': Operations.click as Types.Operations,
        'form-action': Actions.formAction as Types.Operations,
        'sign-up': Operations.signUp as Types.Operations,
        'sign-in': Operations.signIn as Types.Operations,
        'request-password-reset': Operations.requestPasswordReset as Types.Operations,
        'update-password': Operations.updatePassword as Types.Operations,
        'sign-out': Operations.signOut as Types.Operations,
    }, operations) as Types.Fields<Types.Operations>;
}

export function getComponents(components: Types.Fields<Types.ComponentType> = {}): Types.Fields<Types.ComponentType> {
    return Object.assign({
        'component': Components.Component,
        'screen': Components.Screen,
        'app': Components.App,
        'page': Components.Page,
        'display': Components.Display,
        'panel': Components.Panel,
        'item': Components.Item,
        'text': Components.Text,
        'image': Components.Image,
        'svg': Components.Svg,
        'icon': Components.Icon,
        'form-field': Components.FormField,
        'submit': Components.Submit,
        'form': Components.Form
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

