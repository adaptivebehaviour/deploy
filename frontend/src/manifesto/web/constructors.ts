import * as Collection from '@/web/collection';
import * as Utils from '@/web/utils';
import * as Constructors from '@/nextjs/constructors';
export * from '@/nextjs/constructors';
import * as Types from '@/web/types';
import structuresData from '@/nextjs/structures.json' assert { type: 'json' };

const structures = Utils.toFields(structuresData as unknown as Types.Data<Types.StructureArg>) as Types.Fields<Types.StructureArg>;


export class IdPanel<PropType extends Collection.IdPanelProps = Collection.IdPanelProps> extends Constructors.Panel<PropType> {
    logo: Constructors.Image;
    title: Constructors.Text;

    constructor(args: Collection.IdPanelArgs, instanceCreator: Collection.InstanceCreator<Collection.Args, Constructors.Component>) {
        super(args, instanceCreator);
        this.logo = this.setPropWithId('logo', this.instanceCreator.createInstance(this.structure.logo)) as Constructors.Image;
        const textStructure = Utils.mergeDefaultStructure(structures.text as Types.Structures, {
            id: 'title',
            content: [this.structure.title]
        });
        this.title = this.setPropWithId('title', this.instanceCreator.createInstance(textStructure)) as Constructors.Text;
    }

    setSize(size?: number): number{
        this.size = size ?? this.size;
        this.setPropSize(['logo', 'title'], this.size);
        return this.size;
    }
}

export class NavBarItem<PropType extends Collection.NavProps = Collection.NavProps> extends Constructors.Component<PropType> {
    constructor(args: Collection.NavProps, instanceCreator: Collection.InstanceCreator<Collection.Args, Constructors.Component>) {
        super(args, instanceCreator);
        let component = this.structure.component as Collection.ComponentStructureType | string;
        const link = this.structure.link ?? component?.link ?? "/";
        if(typeof component === 'string'){
            component = Utils.mergeDefaultStructure(structures.text as Types.Structures, {
                id: Utils.toId(component as string),
                content: [component]
            }) as Collection.ComponentStructureType;
        }
        else{
            component.link = null;
        }
        this.link = this.setProp('link', link) as string;
        this.component = this.setProp('component', this.instanceCreator.createInstance(component)) as Constructors.Component;
    }

    setSize(size?: number): number{
        const newSize = super.setSize(size);
        this.setPropSize('component', newSize);
        return newSize;
    }
}

export class NavBar<PropType extends Collection.ComponentProps = Collection.ComponentProps> extends Constructors.Component<PropType> {
    constructor(args: Collection.ComponentArgs, instanceCreator: Collection.InstanceCreator<Collection.Args, Constructors.Component>) {
        super(args, instanceCreator);
    }

    createContent(): NavBarItem[] {
        this.content = this.content.map((componentArgs: Collection.ComponentArgs) => {
            let path: string = "/";
            if(typeof componentArgs === 'string'){
                path = componentArgs;
            }
            else if((componentArgs as Collection.ComponentStructureArg).link){
                path = (componentArgs as Collection.ComponentStructureArg).link as string;
            }
            else{
                path = (componentArgs as Collection.ContentField).content[0] as string;
            }
            path = (path === 'Home' || path === 'home') ? "/" : "/" + Utils.uncap(path);
            if((componentArgs as Collection.ComponentStructureArg).link){
                (componentArgs as Collection.ComponentStructureArg).link = path as string;
            }
            return new NavBarItem({link: path, component: componentArgs} as Collection.NavProps, this.instanceCreator as Collection.InstanceCreator<Collection.Args, Constructors.Component>);
        });
        return this.content as NavBarItem[];
    }

    setSize(size?: number): number{
        const setSize = super.setSize(size);
        return this.setContentSize(setSize);
    }
}

export class Menu<PropType extends Collection.MenuProps = Collection.MenuProps> extends Constructors.Component<PropType> {
    anchor: Constructors.Icon;
    constructor(args: Collection.ComponentArgs, instanceCreator: Collection.InstanceCreator<Collection.Args, Constructors.Component>) {
        super(args, instanceCreator);
        this.anchor = this.setProp('anchor', this.instanceCreator.createInstance(this.structure.anchor)) as Constructors.Icon;
        this.setSize()
    }

    setSize(size?: number): number{
        const setSize = super.setSize(size);
        this.setPropSize('anchor', setSize);
        return setSize;
    }
}

export class Header<PropType extends Collection.HeaderProps = Collection.HeaderProps> extends Constructors.Display<PropType> {
    idPanel: IdPanel;
    siteNav: NavBar;
    menu: Menu;

    constructor(args: Collection.HeaderArgs, instanceCreator: Collection.InstanceCreator<Collection.Args, Constructors.Component>) {
        super(args, instanceCreator);
        this.idPanel = this.setPropWithId('idPanel', this.instanceCreator.createInstance(this.structure.idPanel)) as IdPanel;
        this.idPanel.createContent();
        this.siteNav = this.setPropWithId('siteNav', this.instanceCreator.createInstance(this.structure.siteNav)) as NavBar;
        this.siteNav.createContent();
        const menuStructure = this.structure.menu as Collection.ComponentStructureType;
        menuStructure.content = (this.siteNav.content as NavBarItem[]).map((item: NavBarItem) => {
            return {link: item.structure.link, component: item.structure.component}
            });
        this.menu = this.setProp('menu', this.instanceCreator.createInstance(this.structure.menu)) as Menu;
        this.setSize()
    }

    setSize(size?: number): number{
        const setSize = super.setSize(size);
        this.setPropSize(['idPanel', 'menu'], this.size);
        this.setPropSize('siteNav', this.size * .5);
        return setSize;
    }
}

export class Body<PropType extends Collection.ComponentProps = Collection.ComponentProps> extends Constructors.Display<PropType> {

    constructor(args: Collection.HeaderArgs, instanceCreator: Collection.InstanceCreator<Collection.Args, Constructors.Component>) {
        super(args, instanceCreator);
    }
}

export class Footer<PropType extends Collection.HeaderProps = Collection.HeaderProps> extends Constructors.Display<PropType> {

    constructor(args: Collection.HeaderArgs, instanceCreator: Collection.InstanceCreator<Collection.Args, Constructors.Component>) {
        super(args, instanceCreator);
    }
}

export class Webpage<PropType extends Collection.WebpageProps = Collection.WebpageProps> extends Constructors.Screen<PropType> {
    route: string;
    header: Header;
    body: Body;
    footer: Footer;

    constructor(args: Collection.ComponentArgs | string, instanceCreator: Collection.InstanceCreator<Collection.Args, Constructors.Component>) {
        super(args, instanceCreator);
        this.route = this.structure.route as string;
        const siteNav = (this.structure.header as Collection.HeaderArgs).siteNav as Collection.ContentField;
        const routeTitle = siteNav.content.includes(Utils.cap(this.route)) ? Utils.cap(this.route) : (siteNav.content.includes(this.route) ? this.route : false)
        if(routeTitle){
            const index = siteNav.content.indexOf(routeTitle);
            siteNav.content.splice(index, 1);
            siteNav.content.push("Home");
        }
        (this.structure.header as Collection.HeaderArgs).siteNav = siteNav
        this.header = this.setProp('header', this.instanceCreator.createInstance(this.structure.header)) as Header;
        this.body = this.setProp('body', this.instanceCreator.createInstance(this.structure.body)) as Constructors.Component;
        this.footer = this.setProp('footer', this.instanceCreator.createInstance(this.structure.footer)) as Footer;
    }
}
