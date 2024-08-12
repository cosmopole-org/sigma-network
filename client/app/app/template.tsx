'use client'

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function Template({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    )
}