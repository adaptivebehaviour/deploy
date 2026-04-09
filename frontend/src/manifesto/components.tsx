import * as Style from '@/manifesto/style'
import {getManifest} from '@/manifesto/manifest'
import structures from '@/manifesto/structures.json' assert { type: 'json' };

const manifest = getManifest();

export const metadata = Object.assign(structures.metadata, {
    url: manifest.url,
    title: manifest.title,
    keywords: manifest.keywords,
    openGraph: {
        url: manifest.url,
        type: "website",
        title: manifest.title,
        images: [],
        siteName: manifest.title,
        description: manifest.description
    },
    description: manifest.description
});

export function Layout({children}: {children: React.ReactNode}) {
    return (
        <html lang="en" className={`${Style.sans.variable} ${Style.serif.variable} ${Style.mono.variable} ${Style.ui.variable} ${Style.id.variable}`}>
        <body>{children}</body>
    </html>)
}
