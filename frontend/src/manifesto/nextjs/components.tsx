'use client';
import NextImage from 'next/image';
import * as Collection from '@/nextjs/collection';
import {collect} from '@/manifesto/collect';
import { propsToCSS } from '@/nextjs/style';
import useSWR from 'swr'
import * as React from 'react';
import * as Utils from '@/nextjs/utils';
import {Form as RadixForm} from 'radix-ui'

const collection = collect();

export function extendRadix(
    title: string, 
    radixComponent: Collection.ComponentType, 
    construct: (
        props: Collection.RadixProps,
        forwardedRef: Collection.RadixRef
    ) => React.ReactElement
){
    const component = React.forwardRef<
        React.ComponentRef<typeof radixComponent>,
        React.ComponentPropsWithoutRef<typeof radixComponent>>
    ((props, forwardedRef) => (construct(props, forwardedRef)))
    component.displayName = title
    return component}

export function getChildren<PropsType extends Collection.ComponentProps = Collection.ComponentProps>(props?: PropsType | null | undefined, children?: Collection.Children): Collection.Children[]{

    const contentChildren: Collection.JSX[] = ((props?.content || []) as PropsType[]).map(
        (content, index) => typeof content === 'string' 
            ? collection.createComponent({ ...collection.createProps(content) }, undefined, index)
            : collection.createComponent(content as Collection.ComponentProps, undefined, index)
    );
    const childrenArray: Collection.Children[] = children ? (Array.isArray(children) ? children : [children]) : [];
    return [...contentChildren, ...childrenArray];
}

export function getChildrenAsFields<PropsType extends Collection.ComponentProps = Collection.ComponentProps>(props?: PropsType | null | undefined, children?: Collection.Children): Collection.Fields<Collection.Children>{
    const childrenArray = getChildren<PropsType>(props, children) as Collection.Children[];
    const childrenFields: Collection.Fields<Collection.Children> = {};
    childrenArray.forEach((child, index) => {
        const id = typeof child === 'string' ? "" + index : (child as Collection.JSX).props?.id ?? "" + index;
        childrenFields[id] = child;
    });
    return childrenFields;
}

export function getCSS(props?: Collection.ComponentProps | null): React.CSSProperties{
    const styleArgs = props?.style ?? {} as Collection.StyleProps;
    return propsToCSS(styleArgs) as React.CSSProperties;
}

export function useGetItem(props: Collection.ItemProps | string): Collection.Value{
    let propsItem = typeof props !== 'string' ? props.item : undefined;
    if(propsItem === null){
        propsItem = collection.createProps(props);
    }
    let uri: string | null = null;
    if(typeof propsItem === 'object' && Utils.isType(propsItem as Collection.TypeField, 'fetcher')){
        const fetcher = collection.createInstance(propsItem as Collection.TypeField) as Collection.IFetcher;
        const props = fetcher.getProps() as Collection.FetcherProps;
        uri = props.uri !== null ? props.uri : '/fetching?fetcher=' + fetcher.id + '&target=' + fetcher.target;
    }
    return useFetch(uri) ?? (propsItem || props);
}

export function useFetch(arg: string | null): Collection.Value {
    const { data, error, isLoading } = useSWR(typeof arg === 'string' ? arg : null, (uri: string) => fetch(uri).then(res => res.json())) 
    if (error) return { component: <div>failed to load</div>}
    if (isLoading) return { component: <div>loading...</div>}
    return data ?? arg;
}

export function Screen({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    children = getChildren(props, children) as Collection.Children;
    return (<div className='screen' style={getCSS(props)} key={index ?? 0}>{children}</div>);
}

export function App({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    children = getChildren(props, children) as Collection.Children;
    return (<div className='app' style={getCSS(props)} key={index ?? 0}>{children}</div>);
}

export function Page({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    children = getChildren(props, children) as Collection.Children;
    return (<div className='page' style={getCSS(props)} key={index ?? 0}>{children}</div>);
}

export function Component({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    children = getChildren(props, children) as Collection.Children;
    return (<div className='component' style={getCSS(props)} key={index ?? 0}>{children}</div>);
}

export function Display({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    children = getChildren(props, children) as Collection.Children;
    return (<div className='display' style={getCSS(props)} key={index ?? 0}>{children}</div>);
}

export function Panel({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    children = getChildren(props, children) as Collection.Children;
    return (<div className='panel' style={getCSS(props)} key={index ?? 0}>{children}</div>);
}

export function Item({props, children, index}: Collection.JSXArgs){
    const itemProps = props as unknown as Collection.ItemProps;
    const item = useGetItem(itemProps) as Collection.Fields | Collection.Value;
    if((item as Collection.Fields)?.component || item === null){
        return (<svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 96 96' width={16} height={16} fill="#000000">
            <path d="M47.9965 6C50.6592 6 53.1156 7.40635 54.4657 9.71277L94.9686 78.7177C96.3375 81.0429 96.3375 83.9118 95.0061 86.237C93.6748 88.5622 91.1809 90.006 88.4994 90.006H7.49362C4.81217 90.006 2.31825 88.5622 0.9869 86.237C-0.344445 83.9118 -0.325694 81.0241 1.0244 78.7177L41.5273 9.71277C42.8774 7.40635 45.3338 6 47.9965 6ZM47.9965 30.0017C45.5026 30.0017 43.4962 32.0081 43.4962 34.502V55.5035C43.4962 57.9975 45.5026 60.0039 47.9965 60.0039C50.4905 60.0039 52.4969 57.9975 52.4969 55.5035V34.502C52.4969 32.0081 50.4905 30.0017 47.9965 30.0017ZM53.997 72.0047C53.997 70.4133 53.3648 68.8871 52.2395 67.7618C51.1142 66.6365 49.5879 66.0043 47.9965 66.0043C46.4051 66.0043 44.8789 66.6365 43.7536 67.7618C42.6283 68.8871 41.9961 70.4133 41.9961 72.0047C41.9961 73.5961 42.6283 75.1224 43.7536 76.2477C44.8789 77.373 46.4051 78.0052 47.9965 78.0052C49.5879 78.0052 51.1142 77.373 52.2395 76.2477C53.3648 75.1224 53.997 73.5961 53.997 72.0047Z"></path>
        </svg>)
    }
    return <Component key={index ?? 0} {...{props: props, children: children}} />;
}

export function Text({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>) {
    const textProps = props as unknown as Collection.TextProps;
    const item = useGetItem(typeof children === 'string' ? children : textProps) as Collection.JSX | string | {component: Collection.JSX};
    return typeof item === 'string' ? <p key={index ?? 0} style={getCSS(textProps as unknown as Collection.ComponentProps)}>{item}</p> : ((item as {component: Collection.JSX}).component);
}

export function Image({props, index}: Collection.JSXArgs<Collection.ComponentProps>){
    const imageProps = props as unknown as Collection.ImageProps;
    const item = useGetItem(imageProps) as Collection.ImageProps & {component?: Collection.JSX; url?: string};
    return item.component || <NextImage key={index || 0} className='object-contain' src={item.url as string} width={imageProps.width} height={imageProps.height} alt={imageProps.alt ?? (item as { alt?: string }).alt ?? ''} />
}

export function Svg({props, index}: Collection.JSXArgs<Collection.ComponentProps>){
    const svgProps = props as unknown as Collection.SvgProps;
    const item = useGetItem(svgProps) as Collection.SvgProps & {component?: Collection.JSX; path?: string; colour?: string};
    if(item.component){
        return (<svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 96 96' width={16} height={16} fill="#000000">
                    <path d="M52.1176 57.1829C53.8852 57.1829 54.8139 56.9256 55.2313 56.7582V51.3418H51.2093V48.7019H58.3082V58.7091L58.1158 58.779C56.7083 59.2811 54.4948 59.8805 51.9416 59.8805C48.7298 59.8805 46.2421 58.9991 44.3477 57.1874C42.5351 55.4379 41.4959 52.676 41.4959 49.6111C41.5286 43.3268 45.9516 39.1068 52.5022 39.1068C54.7935 39.1068 56.6183 39.592 57.5553 40.0462L57.7803 40.1538L56.9989 42.7953L56.6961 42.6607C55.8287 42.2757 54.5603 41.8346 52.4409 41.8346C47.7192 41.8346 44.7814 44.7695 44.7814 49.4928C44.7814 54.2362 47.5923 57.1829 52.1176 57.1829ZM24.0658 39.3126H27.4414L30.5878 49.26C31.3529 51.6568 31.9748 53.7071 32.4617 55.6441C33.0304 53.5246 33.7833 51.2718 34.4625 49.2821L37.8749 39.3126H41.23L33.947 59.6743H30.7106L30.645 59.473L24.0658 39.3126ZM90.5415 90.7129C90.5415 91.6924 89.7436 92.4894 88.7657 92.4894H22.196C21.2181 92.4894 20.4203 91.6924 20.4203 90.7129V65.5444H63.5944C65.5461 65.5444 67.1296 63.9622 67.1296 62.0114V36.9464C67.1296 34.9952 65.5461 33.4142 63.5944 33.4142H20.4203V5.28753C20.4203 4.30801 21.2181 3.51098 22.196 3.51098H68.3038V20.4591C68.3038 23.3755 70.677 25.7466 73.5942 25.7466H90.5415V90.7129ZM16.9097 59.9447C16.6642 59.9611 16.4146 59.9693 16.1568 59.9693C14.2501 59.9693 12.1103 59.43 10.9483 58.6587L10.7683 58.538L11.5866 55.8229L11.9098 56.0221C13.1782 56.8048 14.8353 57.2717 16.3328 57.2717C16.5333 57.2717 16.7256 57.2635 16.9097 57.2459C18.9432 57.0692 20.1789 55.9305 20.1789 54.1883C20.1789 52.5721 19.2869 51.5922 16.9097 50.6364C16.8238 50.6012 16.7297 50.566 16.6397 50.5308C12.9491 49.2224 11.2265 47.355 11.2265 44.6525C11.2265 41.6108 13.5178 39.4063 16.9097 39.0421C17.237 39.0069 17.5725 38.9893 17.9203 38.9893C18.9063 38.9893 19.7411 39.0982 20.4203 39.2516C21.3818 39.4705 22.0446 39.777 22.4333 39.9971L22.646 40.1166L21.75 42.7601L21.4432 42.5916C21.2018 42.4594 20.854 42.2908 20.4203 42.1366C19.7493 41.8976 18.8654 41.6894 17.8303 41.6894C17.5193 41.6894 17.2084 41.7164 16.9097 41.7712C15.5513 42.0216 14.3974 42.8493 14.3974 44.3587C14.3974 45.6848 15.0357 46.5039 16.9097 47.3803C17.2738 47.5514 17.6789 47.7232 18.1412 47.9012C19.0168 48.2396 19.7779 48.6013 20.4203 48.9957C22.4702 50.2452 23.3744 51.816 23.3744 53.9821C23.3744 55.6371 22.732 57.1314 21.5659 58.1907C21.2263 58.5008 20.8417 58.7709 20.4203 59.0016C19.4383 59.5397 18.2558 59.8592 16.9097 59.9447ZM71.3152 0.515144L70.7875 1.92671e-06H22.196C19.2828 1.92671e-06 16.9097 2.37229 16.9097 5.28753V33.4142H5.53105C3.57938 33.4142 2 34.9952 2 36.9464V62.0114C2 63.9622 3.57938 65.5444 5.53105 65.5444H16.9097V90.7129C16.9097 93.6281 19.2828 96 22.196 96H88.7657C91.6789 96 94.0521 93.6281 94.0521 90.7129V25.7347V23.9913V23.2528L71.3152 0.515144Z"></path>
                </svg>)
    };
    const getRectPath = ()=> {return <rect x={`${item.x}`} y={`${item.y}`} width={`${item.width}`} height={`${item.height}`} fill={`${svgProps.colour}`}/>}
    const getCirclePath = () => {return <circle cx={`${item.width / 2}`} cy={`${item.height / 2}`} r={`${item.width / 2}`} fill={`${item.colour}`}/>}
    const viewBox = `0 0 ${item.width} ${item.height}`
    const path = item.path === 'rect' ? getRectPath() : (item.path === 'circle' ? getCirclePath() : <path d={`${item.path}`} fill={`${svgProps.colour}`}></path>)
    return <svg key={index} xmlns="http://www.w3.org/2000/svg" viewBox={`${viewBox}`} x={`${svgProps.x}`} y={`${svgProps.y}`} width={`${svgProps.width}`} height={`${svgProps.height}`} stroke="none">{path}</svg>
}

export function Icon({props, index}: Collection.JSXArgs<Collection.IconProps>){
    const children = getChildren(props) as Collection.Children;
    const iconProps = structuredClone(props) as Collection.IconProps;
    const viewBox = `${iconProps.x} ${iconProps.y} ${iconProps.width} ${iconProps.height}` 
    return(<svg key={index} xmlns="http://www.w3.org/2000/svg" viewBox={`${viewBox}`} x={`${iconProps.x}`} y={`${iconProps.y}`} width={`${iconProps.width}`} height={`${iconProps.height}`} stroke="none">
            {children}
        </svg>) 
}

const RadixFormField = extendRadix('Field', RadixForm.Field as unknown as Collection.ComponentType, function(props: Collection.RadixProps, forwardedRef: Collection.RadixRef){
    return (<RadixForm.Field className= "field" {...props as React.ComponentProps<typeof RadixForm.Field>} style={getCSS(props as Collection.ComponentProps)} ref={forwardedRef as React.Ref<HTMLDivElement>} />)})

const RadixFormControl = extendRadix('Control', RadixForm.Control, function(props: Collection.RadixProps, forwardedRef: Collection.RadixRef){
    const componentProps = props as Collection.ComponentProps;
    const id = componentProps.id != null ? String(componentProps.id) : undefined;
    const placeholder = (componentProps.placeholder || '') as string;
    return (<RadixForm.Control className= "outline-none rounding w-full" {...props} style={getCSS(componentProps)} ref={forwardedRef as React.Ref<HTMLInputElement>} id={id} placeholder={placeholder}/>)})

// TODO Create Form-field props type
export function FormField({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    children = getChildren(props) as Collection.Children;
    const name = props?.name != null ? String(props.name) : ''
    const submit = props?.submit || false
    const label = props?.label ? collection.construct(props?.label) : <></>;
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {if(event.key === 'Enter' && !submit){event.preventDefault(); return false}}
    const FormField = RadixFormField as React.ComponentType<React.ComponentProps<typeof RadixForm.Field>>;
    const controlProps = {
        type: props?.input || 'text', 
        required: props?.isRequired || false,
        placeholder: props?.placeholder || ''
    } as React.ComponentPropsWithoutRef<typeof RadixForm.Control>;
    return (<div key={index || 0} className="flex-col">{label as Collection.JSX}<FormField name={name} onKeyDown={handleKeyDown}><RadixFormControl {...controlProps} />{children}</FormField></div>)
}

const RadixSubmit = extendRadix('Submit', RadixForm.Submit, function(props: Collection.RadixProps, forwardedRef: Collection.RadixRef){
    const compProps = props as Collection.ComponentProps;
    const name = compProps.id != null ? String(compProps.id) : '';
    return (<RadixForm.Submit name={name} {...props} ref={forwardedRef as React.Ref<HTMLButtonElement>}></RadixForm.Submit>)})

export function Submit({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    children = getChildren(props, children) as Collection.Children;
    const SubmitButton = RadixSubmit as React.ComponentType<React.ComponentProps<typeof RadixForm.Submit>>;
    return <SubmitButton className= "button cursor-pointer" style={getCSS(props)} key={index ?? 0}>{children}</SubmitButton>
} 

const ExtendedRadixForm = extendRadix('Form', RadixForm.Root, function(props: Collection.RadixProps, forwardedRef: Collection.RadixRef){return (<RadixForm.Root {...props} ref={forwardedRef as React.Ref<HTMLFormElement>} />)})

export function Form({props, children, index}: Collection.JSXArgs<Collection.ComponentProps>){
    const formAction = collection.getOperation((props?.operation || 'formAction') as string) as Collection.Operations // TODO: Fix this when there are more specific component props
    const submit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = Object.fromEntries(new FormData(event.currentTarget)) as Collection.Fields
        return await formAction(data)}
    children = getChildren(props, children) as Collection.Children;
    const Form = ExtendedRadixForm as React.ComponentType<React.ComponentProps<typeof RadixForm.Root>>;
    return <Form onSubmit={submit} className="document" style={getCSS(props)} key={index ?? 0}>{children}</Form>
}


    
// export function PasswordField()
// {
//     const onProps = useFetchAsset('eye-slash', {size: 20, colour: 'black'})!
//     // console.log(onProps)
//     const offProps = useFetchAsset('eye', {size: 20, colour: 'black'})!
//     const [visible, setVisible] = React.useState('password')
//     const onToggle = () => {visible === 'password' ? setVisible('text') : setVisible('password')}

//     return (
//         <Field name="password" >
//             <Control placeholder={"**********"} type={visible} required />
//             <Toggle onImage={onProps} offImage={offProps} onToggle={onToggle} />
//         </Field>)
// }

// export function submitWith(operation: Function)
// {
//     return async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault()
//         const data = Object.fromEntries(new FormData(event.currentTarget))
//         return await operation(data)}
// }

// export type Authenticators = {submit: Function, submitText: string, children?: React.ReactNode}

// export function Authenticator({submit, submitText, children}: Authenticators)
// {
//     const auth = submitWith(submit)
//     return (
//         <Panel>
//             <Form onSubmit={auth}>
//                 <EmailField />
//                 <PasswordField />
//                 <Submit>{submitText}</Submit>
//                 {children}
//             </Form>
//         </Panel>
//     )
// }

// export function AuthenticatorMessage({message}: {message: string[]})
// {
//     let list = message.map((item, index) => (
//         <li className='list-none' key={index}>
//             <div className="w-256 text-center">{item}</div>
//         </li>
//       ));
//     return <Panel>{list}</Panel>
// }

// // export function PasswordReset({click}: {click: Function}){
// //     return(<Clickable click={click}>Forgot password? Reset</Clickable>)}

// export function AnonymousAuthenticator()
// {
//     const [mode, setMode] = React.useState('signUp')

//     async function signUp(creds: { email: string; password: string })
//     {
//         let response = await authSignUp(creds)
//         if(response.error){setMode('signUpError')}else{setMode('signUpEmail')}
//     }

//     async function signIn(creds: { email: string; password: string })
//     {
//         let response = await authSignIn(creds)
//         if(response.error){setMode('signInError')}
//         else{setMode('signedIn')}
//     }

//     const components: any = {
//         "signUp": <Authenticator submit={signUp} submitText={"Sign me up!"}>
//             <Clickable onClick={() => {setMode('signIn')}}>Already have an account? Sign in</Clickable>
//         </Authenticator>,
//         "signUpError": <AuthenticatorMessage message={["Sorry, but we can't sign you up right now.","Please try again in a few minutes"]} />,
//         "signUpEmail": <AuthenticatorMessage message={["Please check your email for a link", "to continue signing up."]} />,
//         "signIn": <Authenticator submit={signIn} submitText={"Sign me in!"}><Column>
//                 <Clickable onClick={() => {setMode('signUp')}}>Don't have an account? Sign up</Clickable>
//                 <Clickable onClick={() => {setMode('requestPasswordReset')}}>Forgot password?</Clickable>
//             </Column></Authenticator>,
//         "signInError": <AuthenticatorMessage message={["Sorry, but we can't sign you in right now.","Please try again in a few minutes"]} />,
//         "signedIn": <AuthenticatorMessage message={["Please wait while we", "sign you in."]} />,
//         "requestPasswordReset": <AuthenticatorMessage message={["Please check your email for a link", "to reset your password."]} />
//     }

//     return(components[mode])
// }

