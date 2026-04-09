'use client'
import * as Web from '@/web/collection';
import * as Components from '@/nextjs/components';
import {collect} from '@/manifesto/collect';
import * as React from 'react';
import {NavigationMenu, DropdownMenu} from 'radix-ui'
import Link from 'next/link'

export function IdPanel({props, children, index}: Web.JSXArgs<Web.IdPanelProps>){
    children = Components.getChildren(props, children) as Web.Children;
    return (<Components.Panel key={index ?? 0}>{children}</Components.Panel>);
}

export function Menu({props, index}: Web.JSXArgs<Web.MenuProps>){
    const menuProps = props as Web.MenuProps;
    const componentsArgs = (menuProps.content).map((link: Web.Links) => link.component);
    const components = Components.getChildren({content: componentsArgs} as unknown as Web.ComponentProps) as Web.Children[];
    const links = menuProps.content.map((link: Web.Links) => link.link);
    
    const items = components.map((component: Web.Children, index: number) => <DropdownMenu.Item key={index}><Link href={links[index]}>{component as Web.Children}</Link></DropdownMenu.Item>) as Web.JSX[];
    
    const anchor = collect().construct(menuProps.anchor) as Web.JSX;
    return(<div className="menu-trigger" style={Components.getCSS(props)} key={index ?? 0}>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button>{anchor}</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content className="menu">
                    {...items}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    </div>)
}

const NavBarItem = React.forwardRef<HTMLAnchorElement, Omit<Web.NavProps, "ref">>(function NavBarItem(props, forwardedRef){
        const component = collect().construct(props.component) as React.ReactNode;
        return <Link href={props.link as string} ref={forwardedRef}>{component}</Link>
    }
)

export function NavBar({props, index}: Web.JSXArgs<Web.NavProps>){
    const navBarProps = props as unknown as Web.ComponentProps & {content: Web.NavProps[]};
    
    const navBarItems = navBarProps.content.map((itemProps: Web.NavProps, index: number) => {
        return (
        <NavigationMenu.Item key={index} className="max-h-56 py-1 mx-2.5 xs:mx-4">
            <NavigationMenu.Link asChild className="flex">
                <NavBarItem {...itemProps}/>
            </NavigationMenu.Link>
        </NavigationMenu.Item>)
    })

    return (
        <NavigationMenu.Root key={index} className="nav-bar">
            <NavigationMenu.List className="center flex px-1 justify-between" >
            {...navBarItems}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    )
}

export function Header({props, children, index}: Web.JSXArgs<Web.HeaderProps>){
    const childrenFields = Components.getChildrenAsFields(props, children) as Web.Fields<Web.Children>;
    childrenFields.siteNav = <div className='show-md justify-center' key={(childrenFields.siteNav as Web.JSX)?.key ?? 'siteNav'}>{childrenFields.siteNav}</div>;
    return (<div className='header' style={Components.getCSS(props)} key={index ?? 0}>{Object.values(childrenFields)}</div>);
}

export function Body({props, children, index}: Web.JSXArgs<Web.ComponentProps>){
    children = Components.getChildren(props, children) as Web.Children;
    return (<div className='body' style={Components.getCSS(props)} key={index ?? 0}>{children}</div>);
}

export function Footer({props, children, index}: Web.JSXArgs<Web.ComponentProps>){
    children = Components.getChildren(props, children) as Web.Children;
    return (<div className='footer' style={Components.getCSS(props)} key={index ?? 0}>{children}</div>);
}

export function Webpage({props, children, index}: Web.JSXArgs<Web.WebpageProps>){
    children = Components.getChildren(props, children) as Web.Children;
    return (<div className='webpage' style={Components.getCSS(props)} key={index ?? 0}>{children}</div>);
}

