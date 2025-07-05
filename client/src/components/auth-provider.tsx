'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useActiveWallet } from 'thirdweb/react';
import { useDispatch } from 'react-redux';
import { stateLogin, getUserDetails } from "@/store/reducers/userSlice";

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const activeWallet = useActiveWallet();

    useEffect(() => {
        const timeout = setTimeout(() => {
            const jwt = Cookies.get('jwt');
            if (!jwt) {
                router.push('/signin');
                return;
            }

            const wallet_address = activeWallet?.getAdminAccount?.()?.address;
            const smart_wallet_address = activeWallet?.getAccount()?.address;

            if (!wallet_address || !smart_wallet_address) {
                router.push('/signin');
                return;
            }

            dispatch(stateLogin({ wallet_address, smart_wallet_address }));
            dispatch<any>(getUserDetails({ wallet_address, smart_wallet_address }));
        }, 5000); // wait for 5 seconds before running auth logic

        return () => clearTimeout(timeout); // clean up on unmount
    }, [activeWallet, dispatch, router]);

    return <>{children}</>;
};

export default AuthGuard;
