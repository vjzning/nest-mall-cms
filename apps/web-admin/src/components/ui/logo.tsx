import React from 'react';

interface LogoProps {
    className?: string;
}

export function Logo({ className = 'w-8 h-8' }: LogoProps) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={className}
        >
            <path
                d='M12 2L3 7V17L12 22L21 17V7L12 2Z'
                className='fill-primary/20 stroke-primary'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M12 22V12'
                className='stroke-primary'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M12 12L21 7'
                className='stroke-primary'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M12 12L3 7'
                className='stroke-primary'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M12 6L12 18'
                className='stroke-primary/40'
                strokeWidth='1'
                strokeDasharray='2 2'
            />
            <circle
                cx='12'
                cy='12'
                r='3'
                className='fill-primary stroke-background'
                strokeWidth='1'
            />
        </svg>
    );
}
