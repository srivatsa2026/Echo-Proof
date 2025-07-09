'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useActiveWallet } from 'thirdweb/react';
import { useDispatch, useSelector } from 'react-redux';
import { stateLogin, getUserDetails } from "@/store/reducers/userSlice";

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const activeWallet = useActiveWallet();
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [authAttempts, setAuthAttempts] = useState(0);

    // Check Redux state for existing authentication
    const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
    // Only declare userWalletAddress once using wallet_address from Redux
    const userWalletAddress = useSelector((state: any) => state.user.wallet_address);

    // Check if current path is public (doesn't require auth)
    const isPublicPath =
        pathname === '/signin' ||
        pathname === '/learn-more' ||
        pathname === '/' ||
        pathname === '/join-chatroom' ||
        /^\/join-chatroom(\/[^\/]+)?$/.test(pathname) ||
        pathname === '/join-meeting' ||
        /^\/join-meeting(\/[^\/]+)?$/.test(pathname);

    useEffect(() => {
        // console.log('AuthGuard: Pathname changed to:', pathname);
        // console.log('AuthGuard: Is public path:', isPublicPath);

        // If it's a public path, don't check authentication
        if (isPublicPath) {
            // console.log('AuthGuard: Public path, skipping auth check');
            setIsAuthenticating(false);
            return;
        }

        // If already authenticated in Redux state, skip auth check
        if (isAuthenticated && userWalletAddress) {
            // console.log('AuthGuard: Already authenticated in Redux state');
            setIsAuthenticating(false);
            return;
        }

        const checkAuth = () => {
            // JWT check removed; handled by middleware
            const wallet_address = activeWallet?.getAdminAccount?.()?.address;



            if (!wallet_address) {
                // console.log('Wallet not connected, attempt:', authAttempts + 1);
                setAuthAttempts(prev => prev + 1);

                // Try again after a short delay, but limit attempts
                if (authAttempts < 15) { // Increased attempts for slower connections
                    setTimeout(checkAuth, 1500); // Increased delay
                } else {
                    // console.log('Max auth attempts reached, redirecting to signin');
                    router.push('/signin');
                }
                return;
            }

            // console.log('Authentication successful, wallet addresses:', { wallet_address, smart_wallet_address });
            dispatch(stateLogin({ wallet_address }));
            dispatch<any>(getUserDetails());
            setIsAuthenticating(false);
        };

        // Start authentication check with a small initial delay
        const initialDelay = setTimeout(() => {
            // console.log('AuthGuard: Starting auth check after initial delay');
            checkAuth();
        }, 500);

        // Cleanup function
        return () => {
            clearTimeout(initialDelay);
            setIsAuthenticating(false);
        };
    }, [activeWallet, dispatch, router, pathname, authAttempts, isPublicPath, isAuthenticated, userWalletAddress]);

    // Show loading state while authenticating
    if (isAuthenticating && !isPublicPath) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <h2 className="text-lg font-medium">Checking wallet connectiono...</h2>
                <p className="text-sm text-muted-foreground">Please wait while we establish your connection.</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;
