import {collect, JSX, WebCollectionInstance} from '@/manifesto/collect';

const collection = collect() as WebCollectionInstance;
const component = collection.constructPage() as JSX;


export default async function Home() {
    return (<div>{component}</div>);
}
 