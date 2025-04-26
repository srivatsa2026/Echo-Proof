'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const jwt = Cookies.get('jwt');
        console.log("the jwt is ", jwt)
        if (!jwt) {
            router.push('/signin');
        } else {
            setIsVerified(true); // Only show children once auth is confirmed
        }
    }, []);

    if (!isVerified) router.push("/");

    return <>{children}</>;
};

export default AuthGuard;
