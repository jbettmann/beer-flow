'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';


import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import { Moon, Sun } from 'lucide-react';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            className='mr-2 h-8 w-8 rounded-full bg-background'
            variant='outline'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className='h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-500 ease-in-out dark:rotate-0 dark:scale-100' />
            <Moon className='scale-1000 absolute h-[1.2rem] w-[1.2rem] rotate-0 transition-transform duration-500 ease-in-out dark:-rotate-90 dark:scale-0' />
            <span className='sr-only'>Switch Theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Switch Theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
