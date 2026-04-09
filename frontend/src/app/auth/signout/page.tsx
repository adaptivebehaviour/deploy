import {collect} from '@/manifesto/collect';
import { JSX } from 'react';

const collection = collect();
const operation = (collection as any).getOperation("sign-out")
const response = await operation()
const message = response.error ? "There was an error signing out" : "Signed out"
let component = (collection as any).construct(message) as JSX.Element

export default async function SignOut() {
    return (<div>{component}</div>);
}
