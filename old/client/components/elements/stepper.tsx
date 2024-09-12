"use client"

import * as React from 'react';
import Icon from './icon';
import { Card } from '@nextui-org/react';
import { useTheme } from 'next-themes';

export type StepperStep = { key: string, text: string, icon: string }

const StepperNode = ({ isCurrent, step, active }: Readonly<{ isCurrent?: boolean, step: StepperStep, active: boolean }>) => {
	const { theme } = useTheme();
    const nonActiveColor = theme === 'light' ? '#bbb' : '#444';
    return (
        <Card
            className={`w-16 h-16 rounded-full p-4`}
            shadow={isCurrent ? 'md' : 'sm'}
            style={{
                backgroundColor: !active ? nonActiveColor : undefined,
                backgroundImage: active ?
                    `linear-gradient( 136deg, ${'#c4b5fd'} 0%, ${'#7e22ce'} 50%, ${'#581c87'} 100%)` :
                    undefined
            }}
        >
            <Icon name={step.icon} color={active ? '#ffffff' : '#eeeeee'} size={[32, 32]} />
        </Card>
    )
}

const StepperLine = ({ active }: Readonly<{ active?: boolean }>) => {
    return (
        <div
            className={`w-48 h-1 rounded-sm mt-7 ml-3`}
            style={{
                backgroundImage: active ?
                    `linear-gradient( 136deg, ${'#c4b5fd'} 0%, ${'#c4b5fd'} 50%, ${'#c4b5fd'} 100%)` :
                    `linear-gradient( 136deg, ${'#cbd5e1'} 0%, ${'#cbd5e1'} 50%, ${'#cbd5e1'} 100%)`
            }}
        >
        </div>
    )
}

export default function Stepper({ steps, className }: Readonly<{ className?: string, steps: StepperStep[] }>) {
    return (
        <div className={'w-full gap-3 flex justify-center ' + (className ?? "")}>
            {steps.map((item, index) => (
                <div key={item.key} className='flex'>
                    <StepperNode active={index <= steps.length - 2} isCurrent={index == steps.length - 2} step={item} />
                    {index < steps.length - 1 ? <StepperLine active={index <= steps.length - 2} /> : null}
                </div>
            ))}
        </div>
    );
}
