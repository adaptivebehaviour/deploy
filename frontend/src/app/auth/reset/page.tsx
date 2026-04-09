import {collect} from '@/manifesto/collect';
import { JSX } from 'react';

const collection = collect();
const component = (collection as any).construct("{$auth-password-reset}") as JSX.Element; // TODO: Add password reset form

export default async function Reset() {
    return (<div>{component}</div>);
}
