import {Layout as ManifestLayout, metadata as manifestMetadata }  from '@/manifesto/components'
import type { Metadata } from 'next'
import './globals.css'

    export const dynamic = 'force-dynamic'
 
export const metadata: Metadata = manifestMetadata

export default function Layout({children}: {children: React.ReactNode}) {
    return <ManifestLayout>{children}</ManifestLayout>
}

