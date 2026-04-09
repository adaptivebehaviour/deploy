

export default async function Error({ searchParams }: { searchParams: { error: string } }) {
    const params = await searchParams;
    console.log(params)
    return (<div>{params.error}</div>);
}
