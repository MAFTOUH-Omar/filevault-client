import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteNavbar } from '@/components/marketing/site-navbar';
import SmoothScroll from '@/components/motion/smooth-scroll';

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <SmoothScroll>
            <SiteNavbar />
            <main>{children}</main>
            <SiteFooter />
        </SmoothScroll>
    );
}
