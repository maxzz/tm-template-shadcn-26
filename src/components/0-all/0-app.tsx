import { Toaster } from '@/ui/shadcn/sonner';
import { AllDialogs } from './1-globals';
import { Header } from '../1-header';
import { MainBody } from '../2-main';
import { Footer } from '../3-footer';

export function App() {
    return (<>
        <Toaster />
        <AllDialogs />
        
        <main className="min-h-screen text-xs bg-background grid grid-rows-[auto_1fr_auto]">
            <Header />
            <MainBody />
            <Footer />
        </main>
    </>);
}
